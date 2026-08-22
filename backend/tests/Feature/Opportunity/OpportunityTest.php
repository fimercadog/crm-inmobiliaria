<?php

namespace Tests\Feature\Opportunity;

use App\Enums\OpportunityStage;
use App\Enums\OpportunityStatus;
use App\Enums\UserRole;
use App\Models\Client;
use App\Models\Opportunity;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpportunityTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_list_opportunities(): void
    {
        $this->getJson('/api/v1/opportunities')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_opportunities_paginated(): void
    {
        $this->actingUser();
        Opportunity::factory(12)->create();

        $response = $this->getJson('/api/v1/opportunities?per_page=10');

        $response->assertOk()->assertJsonCount(10, 'data.items')->assertJsonPath('data.meta.total', 12);
    }

    public function test_stage_filter_narrows_results(): void
    {
        $this->actingUser();
        Opportunity::factory(3)->create(['stage' => OpportunityStage::Nuevo]);
        Opportunity::factory(2)->create(['stage' => OpportunityStage::Negociacion]);

        $response = $this->getJson('/api/v1/opportunities?filter[stage]=negociacion');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_authenticated_user_can_create_an_opportunity(): void
    {
        $this->actingUser();
        $client = Client::factory()->create();
        $property = Property::factory()->create();

        $payload = [
            'client_id' => $client->id,
            'property_id' => $property->id,
            'value' => 300_000_000,
            'stage' => OpportunityStage::Contactado->value,
            'probability' => 40,
        ];

        $response = $this->postJson('/api/v1/opportunities', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.stage', 'contactado')
            ->assertJsonPath('data.status', 'abierta');

        $this->assertDatabaseHas('opportunities', ['client_id' => $client->id, 'stage' => 'contactado']);
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingUser();

        $this->postJson('/api/v1/opportunities', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['client_id', 'stage']);
    }

    public function test_status_is_derived_from_stage_and_not_client_settable(): void
    {
        $this->actingUser();
        $client = Client::factory()->create();

        $response = $this->postJson('/api/v1/opportunities', [
            'client_id' => $client->id,
            'stage' => OpportunityStage::CierreGanado->value,
            'status' => 'abierta',
        ]);

        $response->assertCreated()->assertJsonPath('data.status', OpportunityStatus::Ganada->value);
    }

    public function test_updating_stage_to_lost_updates_status(): void
    {
        $this->actingUser();
        $opportunity = Opportunity::factory()->create(['stage' => OpportunityStage::Negociacion]);

        $response = $this->putJson("/api/v1/opportunities/{$opportunity->id}", [
            'client_id' => $opportunity->client_id,
            'stage' => OpportunityStage::CierrePerdido->value,
        ]);

        $response->assertOk()->assertJsonPath('data.status', OpportunityStatus::Perdida->value);
    }

    public function test_closed_at_is_set_when_stage_becomes_terminal_and_cleared_on_reopen(): void
    {
        $this->actingUser();
        $opportunity = Opportunity::factory()->create(['stage' => OpportunityStage::Negociacion]);
        $this->assertNull($opportunity->closed_at);

        $this->putJson("/api/v1/opportunities/{$opportunity->id}", [
            'client_id' => $opportunity->client_id,
            'stage' => OpportunityStage::CierreGanado->value,
        ])->assertOk();

        $opportunity->refresh();
        $this->assertNotNull($opportunity->closed_at);

        $this->putJson("/api/v1/opportunities/{$opportunity->id}", [
            'client_id' => $opportunity->client_id,
            'stage' => OpportunityStage::Negociacion->value,
        ])->assertOk();

        $opportunity->refresh();
        $this->assertNull($opportunity->closed_at);
    }

    public function test_authenticated_user_can_delete_an_opportunity(): void
    {
        $this->actingUser();
        $opportunity = Opportunity::factory()->create();

        $this->deleteJson("/api/v1/opportunities/{$opportunity->id}")->assertOk();

        $this->assertDatabaseMissing('opportunities', ['id' => $opportunity->id]);
    }

    public function test_can_export_opportunities_as_csv(): void
    {
        $this->actingUser();
        Opportunity::factory(3)->create();

        $response = $this->get('/api/v1/opportunities/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

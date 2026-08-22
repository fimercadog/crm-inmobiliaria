<?php

namespace Tests\Feature\Lead;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Enums\UserRole;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_list_leads(): void
    {
        $this->getJson('/api/v1/leads')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_leads_paginated(): void
    {
        $this->actingUser();
        Lead::factory(12)->create();

        $response = $this->getJson('/api/v1/leads?per_page=10');

        $response->assertOk()->assertJsonCount(10, 'data.items')->assertJsonPath('data.meta.total', 12);
    }

    public function test_source_filter_narrows_results(): void
    {
        $this->actingUser();
        Lead::factory(3)->create(['source' => LeadSource::Web]);
        Lead::factory(2)->create(['source' => LeadSource::Referido]);

        $response = $this->getJson('/api/v1/leads?filter[source]=referido');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_authenticated_user_can_create_a_lead(): void
    {
        $this->actingUser();

        $payload = [
            'name' => 'Pedro Gómez',
            'phone' => '3009998877',
            'source' => LeadSource::Whatsapp->value,
            'status' => LeadStatus::Nuevo->value,
        ];

        $response = $this->postJson('/api/v1/leads', $payload);

        $response->assertCreated()->assertJsonPath('data.name', $payload['name']);
        $this->assertDatabaseHas('leads', ['name' => $payload['name']]);
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingUser();

        $this->postJson('/api/v1/leads', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'source', 'status']);
    }

    public function test_authenticated_user_can_convert_a_lead_to_client(): void
    {
        $this->actingUser();
        $lead = Lead::factory()->create([
            'name' => 'Laura Jiménez',
            'email' => 'laura@example.com',
            'status' => LeadStatus::Calificado,
        ]);

        $response = $this->postJson("/api/v1/leads/{$lead->id}/convert");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Laura Jiménez')
            ->assertJsonPath('data.email', 'laura@example.com');

        $this->assertDatabaseHas('clients', ['name' => 'Laura Jiménez']);

        $lead->refresh();
        $this->assertSame(LeadStatus::Convertido, $lead->status);
        $this->assertNotNull($lead->converted_to_client_id);
    }

    public function test_cannot_convert_an_already_converted_lead(): void
    {
        $this->actingUser();
        $lead = Lead::factory()->create(['status' => LeadStatus::Convertido]);

        $this->postJson("/api/v1/leads/{$lead->id}/convert")
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_delete_a_lead(): void
    {
        $this->actingUser();
        $lead = Lead::factory()->create();

        $this->deleteJson("/api/v1/leads/{$lead->id}")->assertOk();

        $this->assertDatabaseMissing('leads', ['id' => $lead->id]);
    }

    public function test_can_export_leads_as_csv(): void
    {
        $this->actingUser();
        Lead::factory(3)->create();

        $response = $this->get('/api/v1/leads/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

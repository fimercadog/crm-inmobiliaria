<?php

namespace Tests\Feature\Visit;

use App\Enums\UserRole;
use App\Enums\VisitStatus;
use App\Models\Client;
use App\Models\Property;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_list_visits(): void
    {
        $this->getJson('/api/v1/visits')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_visits_paginated(): void
    {
        $this->actingUser();
        Visit::factory(12)->create();

        $response = $this->getJson('/api/v1/visits?per_page=10');

        $response->assertOk()->assertJsonCount(10, 'data.items')->assertJsonPath('data.meta.total', 12);
    }

    public function test_status_filter_narrows_results(): void
    {
        $this->actingUser();
        Visit::factory(3)->create(['status' => VisitStatus::Pendiente]);
        Visit::factory(2)->create(['status' => VisitStatus::Realizada]);

        $response = $this->getJson('/api/v1/visits?filter[status]=realizada');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_authenticated_user_can_create_a_visit(): void
    {
        $this->actingUser();
        $property = Property::factory()->create();
        $client = Client::factory()->create();

        $payload = [
            'property_id' => $property->id,
            'client_id' => $client->id,
            'scheduled_at' => now()->addDays(2)->toDateTimeString(),
            'status' => VisitStatus::Pendiente->value,
        ];

        $response = $this->postJson('/api/v1/visits', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.property.id', $property->id)
            ->assertJsonPath('data.client.id', $client->id);

        $this->assertDatabaseHas('visits', ['property_id' => $property->id, 'client_id' => $client->id]);
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingUser();

        $this->postJson('/api/v1/visits', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['property_id', 'client_id', 'scheduled_at', 'status']);
    }

    public function test_authenticated_user_can_update_visit_outcome(): void
    {
        $this->actingUser();
        $visit = Visit::factory()->create(['status' => VisitStatus::Pendiente]);

        $response = $this->putJson("/api/v1/visits/{$visit->id}", [
            'property_id' => $visit->property_id,
            'client_id' => $visit->client_id,
            'scheduled_at' => $visit->scheduled_at->toDateTimeString(),
            'status' => VisitStatus::Realizada->value,
            'result' => 'Cliente interesado, solicita segunda visita',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', VisitStatus::Realizada->value)
            ->assertJsonPath('data.result', 'Cliente interesado, solicita segunda visita');
    }

    public function test_authenticated_user_can_delete_a_visit(): void
    {
        $this->actingUser();
        $visit = Visit::factory()->create();

        $this->deleteJson("/api/v1/visits/{$visit->id}")->assertOk();

        $this->assertDatabaseMissing('visits', ['id' => $visit->id]);
    }

    public function test_can_export_visits_as_csv(): void
    {
        $this->actingUser();
        Visit::factory(3)->create();

        $response = $this->get('/api/v1/visits/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

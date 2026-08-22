<?php

namespace Tests\Feature\Activity;

use App\Enums\ActivityType;
use App\Models\Activity;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create();
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_list_activities(): void
    {
        $this->getJson('/api/v1/activities')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_activities_paginated(): void
    {
        $this->actingUser();
        Activity::factory(12)->create();

        $response = $this->getJson('/api/v1/activities?per_page=10');

        $response->assertOk()->assertJsonCount(10, 'data.items')->assertJsonPath('data.meta.total', 12);
    }

    public function test_type_filter_narrows_results(): void
    {
        $this->actingUser();
        Activity::factory(3)->create(['type' => ActivityType::Llamada]);
        Activity::factory(2)->create(['type' => ActivityType::Correo]);

        $response = $this->getJson('/api/v1/activities?filter[type]=correo');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_authenticated_user_can_create_an_activity(): void
    {
        $this->actingUser();

        $payload = [
            'type' => ActivityType::Llamada->value,
            'notes' => 'Cliente solicita más información sobre financiación',
            'occurred_at' => now()->toDateTimeString(),
        ];

        $response = $this->postJson('/api/v1/activities', $payload);

        $response->assertCreated()->assertJsonPath('data.type', 'llamada');
        $this->assertDatabaseHas('activities', ['notes' => $payload['notes']]);
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingUser();

        $this->postJson('/api/v1/activities', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['type', 'notes', 'occurred_at']);
    }

    public function test_activity_can_be_linked_to_a_client_via_morph_map_alias(): void
    {
        $this->actingUser();
        $client = Client::factory()->create();

        $response = $this->postJson('/api/v1/activities', [
            'type' => ActivityType::Nota->value,
            'notes' => 'Seguimiento con el cliente',
            'occurred_at' => now()->toDateTimeString(),
            'subject_type' => 'client',
            'subject_id' => $client->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.subject_type', 'client')
            ->assertJsonPath('data.subject_id', $client->id);

        $activity = Activity::latest('id')->first();
        $this->assertTrue($activity->subject->is($client));
    }

    public function test_authenticated_user_can_delete_an_activity(): void
    {
        $this->actingUser();
        $activity = Activity::factory()->create();

        $this->deleteJson("/api/v1/activities/{$activity->id}")->assertOk();

        $this->assertDatabaseMissing('activities', ['id' => $activity->id]);
    }

    public function test_can_export_activities_as_csv(): void
    {
        $this->actingUser();
        Activity::factory(3)->create();

        $response = $this->get('/api/v1/activities/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

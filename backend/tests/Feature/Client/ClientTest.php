<?php

namespace Tests\Feature\Client;

use App\Enums\ClientStatus;
use App\Enums\UserRole;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_list_clients(): void
    {
        $this->getJson('/api/v1/clients')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_clients_paginated(): void
    {
        $this->actingUser();
        Client::factory(12)->create();

        $response = $this->getJson('/api/v1/clients?per_page=10');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(10, 'data.items')
            ->assertJsonPath('data.meta.total', 12);
    }

    public function test_search_filters_by_name(): void
    {
        $this->actingUser();
        $target = Client::factory()->create(['name' => 'Jorge Andrés Salazar']);
        Client::factory(4)->create();

        $response = $this->getJson('/api/v1/clients?search=Andrés');

        $response->assertOk()->assertJsonCount(1, 'data.items');
        $this->assertSame($target->id, $response->json('data.items.0.id'));
    }

    public function test_authenticated_user_can_create_a_client(): void
    {
        $this->actingUser();

        $payload = [
            'name' => 'Ana Torres',
            'phone' => '3001112233',
            'email' => 'ana@example.com',
            'budget_min' => 200_000_000,
            'budget_max' => 350_000_000,
            'interest_zones' => ['Chapinero', 'Usaquén'],
            'status' => ClientStatus::Activo->value,
        ];

        $response = $this->postJson('/api/v1/clients', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', $payload['name'])
            ->assertJsonPath('data.interest_zones', $payload['interest_zones']);

        $this->assertDatabaseHas('clients', ['name' => $payload['name']]);
    }

    public function test_budget_max_must_be_greater_than_or_equal_to_budget_min(): void
    {
        $this->actingUser();

        $this->postJson('/api/v1/clients', [
            'name' => 'Ana Torres',
            'budget_min' => 300_000_000,
            'budget_max' => 100_000_000,
            'status' => ClientStatus::Activo->value,
        ])->assertStatus(422)->assertJsonValidationErrors(['budget_max']);
    }

    public function test_authenticated_user_can_update_a_client(): void
    {
        $this->actingUser();
        $client = Client::factory()->create(['status' => ClientStatus::Activo]);

        $response = $this->putJson("/api/v1/clients/{$client->id}", [
            'name' => $client->name,
            'status' => ClientStatus::Inactivo->value,
        ]);

        $response->assertOk()->assertJsonPath('data.status', ClientStatus::Inactivo->value);
    }

    public function test_authenticated_user_can_delete_a_client(): void
    {
        $this->actingUser();
        $client = Client::factory()->create();

        $this->deleteJson("/api/v1/clients/{$client->id}")->assertOk();

        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
    }

    public function test_can_export_clients_as_csv(): void
    {
        $this->actingUser();
        Client::factory(3)->create();

        $response = $this->get('/api/v1/clients/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

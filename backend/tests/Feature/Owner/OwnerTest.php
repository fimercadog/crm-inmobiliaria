<?php

namespace Tests\Feature\Owner;

use App\Enums\OwnerStatus;
use App\Models\Owner;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create();
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_list_owners(): void
    {
        $this->getJson('/api/v1/owners')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_owners_paginated(): void
    {
        $this->actingUser();
        Owner::factory(12)->create();

        $response = $this->getJson('/api/v1/owners?per_page=10');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(10, 'data.items')
            ->assertJsonPath('data.meta.total', 12);
    }

    public function test_list_includes_properties_count(): void
    {
        $this->actingUser();
        $owner = Owner::factory()->create();
        Property::factory(3)->create(['owner_id' => $owner->id]);

        $response = $this->getJson('/api/v1/owners');

        $response->assertOk()->assertJsonPath('data.items.0.properties_count', 3);
    }

    public function test_search_filters_by_name_or_document(): void
    {
        $this->actingUser();
        $target = Owner::factory()->create(['name' => 'María Fernanda Restrepo']);
        Owner::factory(4)->create();

        $response = $this->getJson('/api/v1/owners?search=Fernanda');

        $response->assertOk()->assertJsonCount(1, 'data.items');
        $this->assertSame($target->id, $response->json('data.items.0.id'));
    }

    public function test_authenticated_user_can_create_an_owner(): void
    {
        $this->actingUser();

        $payload = [
            'name' => 'Carlos Pérez',
            'document' => '123456789',
            'phone' => '3001234567',
            'email' => 'carlos@example.com',
            'status' => OwnerStatus::Activo->value,
        ];

        $response = $this->postJson('/api/v1/owners', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', $payload['name']);

        $this->assertDatabaseHas('owners', ['name' => $payload['name']]);
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingUser();

        $this->postJson('/api/v1/owners', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'status']);
    }

    public function test_authenticated_user_can_update_an_owner(): void
    {
        $this->actingUser();
        $owner = Owner::factory()->create(['status' => OwnerStatus::Activo]);

        $response = $this->putJson("/api/v1/owners/{$owner->id}", [
            'name' => $owner->name,
            'status' => OwnerStatus::Inactivo->value,
        ]);

        $response->assertOk()->assertJsonPath('data.status', OwnerStatus::Inactivo->value);
    }

    public function test_authenticated_user_can_delete_an_owner(): void
    {
        $this->actingUser();
        $owner = Owner::factory()->create();

        $this->deleteJson("/api/v1/owners/{$owner->id}")->assertOk();

        $this->assertDatabaseMissing('owners', ['id' => $owner->id]);
    }

    public function test_deleting_an_owner_nullifies_its_properties(): void
    {
        $this->actingUser();
        $owner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $owner->id]);

        $this->deleteJson("/api/v1/owners/{$owner->id}")->assertOk();

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'owner_id' => null]);
    }

    public function test_options_endpoint_returns_lightweight_list(): void
    {
        $this->actingUser();
        Owner::factory(3)->create();

        $response = $this->getJson('/api/v1/owners/options');

        $response->assertOk()->assertJsonCount(3, 'data');
        $this->assertSame(['id', 'name'], array_keys($response->json('data.0')));
    }

    public function test_can_export_owners_as_csv(): void
    {
        $this->actingUser();
        Owner::factory(3)->create();

        $response = $this->get('/api/v1/owners/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

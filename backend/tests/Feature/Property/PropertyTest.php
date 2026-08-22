<?php

namespace Tests\Feature\Property;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use App\Enums\UserRole;
use App\Models\Owner;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): User
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));

        return $user;
    }

    public function test_guest_cannot_list_properties(): void
    {
        $this->getJson('/api/v1/properties')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_properties_paginated(): void
    {
        $this->actingUser();
        Property::factory(15)->create();

        $response = $this->getJson('/api/v1/properties?per_page=10');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(10, 'data.items')
            ->assertJsonPath('data.meta.total', 15)
            ->assertJsonPath('data.meta.last_page', 2);
    }

    public function test_search_filters_by_title_or_code(): void
    {
        $this->actingUser();
        $target = Property::factory()->create(['title' => 'Apartamento único en Chapinero']);
        Property::factory(5)->create();

        $response = $this->getJson('/api/v1/properties?search=Chapinero');

        $response->assertOk()->assertJsonCount(1, 'data.items');
        $this->assertSame($target->code, $response->json('data.items.0.code'));
    }

    public function test_status_filter_narrows_results(): void
    {
        $this->actingUser();
        Property::factory(3)->create(['status' => PropertyStatus::Disponible]);
        Property::factory(2)->create(['status' => PropertyStatus::Vendido]);

        $response = $this->getJson('/api/v1/properties?filter[status]=vendido');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_authenticated_user_can_create_a_property(): void
    {
        $this->actingUser();
        $owner = Owner::factory()->create();

        $payload = [
            'title' => 'Casa campestre en La Calera',
            'property_type' => PropertyType::Casa->value,
            'listing_type' => ListingType::Venta->value,
            'status' => PropertyStatus::Disponible->value,
            'owner_id' => $owner->id,
            'city' => 'Bogotá',
            'price' => 950_000_000,
        ];

        $response = $this->postJson('/api/v1/properties', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', $payload['title']);

        $this->assertDatabaseHas('properties', ['title' => $payload['title']]);
        $this->assertNotNull($response->json('data.code'));
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingUser();

        $response = $this->postJson('/api/v1/properties', []);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['title', 'property_type', 'listing_type', 'status', 'city', 'price']);
    }

    public function test_authenticated_user_can_view_a_property(): void
    {
        $this->actingUser();
        $property = Property::factory()->create();

        $this->getJson("/api/v1/properties/{$property->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $property->id);
    }

    public function test_authenticated_user_can_update_a_property(): void
    {
        $this->actingUser();
        $property = Property::factory()->create(['status' => PropertyStatus::Borrador]);

        $response = $this->putJson("/api/v1/properties/{$property->id}", [
            'title' => $property->title,
            'property_type' => $property->property_type->value,
            'listing_type' => $property->listing_type->value,
            'status' => PropertyStatus::Disponible->value,
            'city' => $property->city,
            'price' => $property->price,
        ]);

        $response->assertOk()->assertJsonPath('data.status', PropertyStatus::Disponible->value);
    }

    public function test_authenticated_user_can_delete_a_property(): void
    {
        $this->actingUser();
        $property = Property::factory()->create();

        $this->deleteJson("/api/v1/properties/{$property->id}")->assertOk();

        $this->assertDatabaseMissing('properties', ['id' => $property->id]);
    }

    public function test_can_export_properties_as_csv(): void
    {
        $this->actingUser();
        Property::factory(3)->create();

        $response = $this->get('/api/v1/properties/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }

    public function test_can_export_properties_as_pdf(): void
    {
        $this->actingUser();
        Property::factory(3)->create();

        $response = $this->get('/api/v1/properties/export?format=pdf');

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }
}

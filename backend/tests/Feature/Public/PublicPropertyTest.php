<?php

namespace Tests\Feature\Public;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Models\Owner;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPropertyTest extends TestCase
{
    use RefreshDatabase;

    private function published(array $attributes = []): array
    {
        return ['published_at' => now()->subDay(), 'status' => PropertyStatus::Disponible, ...$attributes];
    }

    public function test_guest_can_list_published_properties_without_auth(): void
    {
        Property::factory(3)->create($this->published());
        Property::factory(2)->create(['published_at' => null]);

        $response = $this->getJson('/api/v1/public/properties');

        $response->assertOk()->assertJsonCount(3, 'data.items');
    }

    public function test_unpublished_properties_are_never_returned(): void
    {
        Property::factory(2)->create(['published_at' => null]);

        $response = $this->getJson('/api/v1/public/properties');

        $response->assertOk()->assertJsonCount(0, 'data.items');
    }

    public function test_listing_supports_filters(): void
    {
        Property::factory(2)->create($this->published(['listing_type' => ListingType::Venta, 'city' => 'Bogotá']));
        Property::factory(3)->create($this->published(['listing_type' => ListingType::Arriendo, 'city' => 'Medellín']));

        $response = $this->getJson('/api/v1/public/properties?filter[listing_type]=venta');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_price_range_filters_narrow_results(): void
    {
        Property::factory()->create($this->published(['price' => 100_000_000]));
        Property::factory()->create($this->published(['price' => 500_000_000]));
        Property::factory()->create($this->published(['price' => 900_000_000]));

        $response = $this->getJson('/api/v1/public/properties?filter[price_min]=200000000&filter[price_max]=600000000');

        $response->assertOk()->assertJsonCount(1, 'data.items');
    }

    public function test_public_property_resource_never_exposes_private_fields(): void
    {
        $owner = Owner::factory()->create(['document' => '123456789', 'phone' => '3001234567']);
        Property::factory()->create($this->published(['owner_id' => $owner->id, 'notes' => 'nota interna confidencial']));

        $response = $this->getJson('/api/v1/public/properties');

        $response->assertOk();
        $json = $response->json('data.items.0');

        $this->assertArrayNotHasKey('owner', $json);
        $this->assertArrayNotHasKey('notes', $json);
        $this->assertArrayNotHasKey('address', $json);
        $this->assertArrayNotHasKey('agent_id', $json);
    }

    public function test_featured_endpoint_only_returns_published_and_featured_properties(): void
    {
        Property::factory(2)->create($this->published(['is_featured' => true]));
        Property::factory()->create($this->published(['is_featured' => false]));
        Property::factory()->create(['published_at' => null, 'is_featured' => true]);

        $response = $this->getJson('/api/v1/public/properties/featured');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_guest_can_view_a_published_property_by_slug(): void
    {
        $property = Property::factory()->create($this->published(['description' => 'Una descripción completa']));

        $response = $this->getJson("/api/v1/public/properties/{$property->slug}");

        $response->assertOk()
            ->assertJsonPath('data.slug', $property->slug)
            ->assertJsonPath('data.description', 'Una descripción completa');
    }

    public function test_unpublished_property_detail_returns_404(): void
    {
        $property = Property::factory()->create(['published_at' => null]);

        $this->getJson("/api/v1/public/properties/{$property->slug}")->assertStatus(404);
    }

    public function test_unknown_slug_returns_404(): void
    {
        $this->getJson('/api/v1/public/properties/no-existe-este-slug')->assertStatus(404);
    }

    public function test_property_detail_includes_ordered_images_and_agent_name_only(): void
    {
        $property = Property::factory()->create($this->published());
        PropertyImage::factory()->create(['property_id' => $property->id, 'sort_order' => 1, 'is_cover' => false]);
        PropertyImage::factory()->create(['property_id' => $property->id, 'sort_order' => 0, 'is_cover' => true]);

        $response = $this->getJson("/api/v1/public/properties/{$property->slug}");

        $response->assertOk()->assertJsonCount(2, 'data.images');
        $this->assertTrue($response->json('data.images.0.is_cover'));

        if ($property->agent_id) {
            $this->assertArrayHasKey('name', $response->json('data.agent'));
            $this->assertArrayNotHasKey('email', $response->json('data.agent'));
        }
    }

    public function test_a_sold_property_disappears_from_the_public_site_even_if_still_published(): void
    {
        // A property can be marked "vendido" without an admin remembering to
        // also clear published_at; the commercial status must gate visibility
        // independently of the publish date.
        $sold = Property::factory()->create($this->published(['status' => PropertyStatus::Vendido]));
        $available = Property::factory()->create($this->published());

        $response = $this->getJson('/api/v1/public/properties');

        $response->assertOk()->assertJsonCount(1, 'data.items');
        $this->assertSame($available->id, $response->json('data.items.0.id'));

        $this->getJson("/api/v1/public/properties/{$sold->slug}")->assertStatus(404);
    }

    public function test_a_reserved_property_remains_publicly_visible(): void
    {
        $reserved = Property::factory()->create($this->published(['status' => PropertyStatus::Reservado]));

        $this->getJson("/api/v1/public/properties/{$reserved->slug}")->assertOk();
    }

    public function test_search_matches_title_city_or_zone(): void
    {
        Property::factory()->create($this->published(['title' => 'Apartamento único en Chapinero']));
        Property::factory(3)->create($this->published());

        $response = $this->getJson('/api/v1/public/properties?search=Chapinero');

        $response->assertOk()->assertJsonCount(1, 'data.items');
    }
}

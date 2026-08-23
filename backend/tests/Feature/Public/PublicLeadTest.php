<?php

namespace Tests\Feature\Public;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Enums\PropertyStatus;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicLeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_submit_a_general_contact_lead(): void
    {
        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'María Fernanda',
            'email' => 'maria@example.com',
            'intent' => 'contacto_general',
            'message' => 'Quisiera más información',
        ]);

        $response->assertCreated()->assertJsonPath('success', true);

        $lead = Lead::first();
        $this->assertSame('María Fernanda', $lead->name);
        $this->assertSame(LeadSource::Web, $lead->source);
        $this->assertSame(LeadStatus::Nuevo, $lead->status);
        $this->assertSame('contacto_general', $lead->metadata['intent']);
        $this->assertSame('Quisiera más información', $lead->notes);
    }

    public function test_lead_can_reference_a_property_of_interest(): void
    {
        $property = Property::factory()->create(['published_at' => now()->subDay(), 'status' => PropertyStatus::Disponible]);

        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'Carlos Pérez',
            'phone' => '3001234567',
            'intent' => 'compra_arriendo',
            'property_id' => $property->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('leads', ['name' => 'Carlos Pérez', 'property_id' => $property->id]);
    }

    public function test_lead_rejects_a_property_that_is_not_published(): void
    {
        $property = Property::factory()->create(['published_at' => null]);

        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'Carlos Pérez',
            'phone' => '3001234567',
            'intent' => 'compra_arriendo',
            'property_id' => $property->id,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['property_id']);
    }

    public function test_lead_requires_at_least_email_or_phone(): void
    {
        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'Sin contacto',
            'intent' => 'contacto_general',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_lead_requires_a_name(): void
    {
        $this->postJson('/api/v1/public/leads', ['email' => 'a@example.com', 'intent' => 'contacto_general'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_sell_my_property_intent_stores_structured_metadata(): void
    {
        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'Propietario Interesado',
            'email' => 'propietario@example.com',
            'intent' => 'vender_propiedad',
            'metadata' => [
                'property_type' => 'apartamento',
                'listing_type' => 'venta',
                'city' => 'Bogotá',
                'zone' => 'Chapinero',
                'estimated_price' => 500_000_000,
            ],
        ]);

        $response->assertCreated();
        $lead = Lead::first();

        $this->assertSame('vender_propiedad', $lead->metadata['intent']);
        $this->assertSame('Chapinero', $lead->metadata['zone']);
        $this->assertSame(500_000_000, $lead->metadata['estimated_price']);
    }

    public function test_intent_inside_metadata_cannot_override_the_validated_intent(): void
    {
        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'Intento de override',
            'email' => 'override@example.com',
            'intent' => 'contacto_general',
            'metadata' => ['intent' => 'vender_propiedad'],
        ]);

        // 'intent' isn't an allowed metadata key at all, so the request is rejected outright.
        $response->assertStatus(422)->assertJsonValidationErrors(['metadata']);
    }

    public function test_metadata_rejects_unknown_keys(): void
    {
        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'Clave desconocida',
            'email' => 'unknown@example.com',
            'intent' => 'contacto_general',
            'metadata' => ['not_a_real_field' => 'valor'],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['metadata']);
    }

    public function test_source_cannot_be_spoofed_by_the_client(): void
    {
        $response = $this->postJson('/api/v1/public/leads', [
            'name' => 'Intento de spoof',
            'email' => 'spoof@example.com',
            'intent' => 'contacto_general',
            'source' => 'referido',
        ]);

        $response->assertCreated();
        $this->assertSame(LeadSource::Web, Lead::first()->source);
    }

    public function test_submission_is_throttled(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/public/leads', [
                'name' => "Lead {$i}",
                'email' => "lead{$i}@example.com",
                'intent' => 'contacto_general',
            ])->assertCreated();
        }

        $this->postJson('/api/v1/public/leads', [
            'name' => 'Lead 11',
            'email' => 'lead11@example.com',
            'intent' => 'contacto_general',
        ])->assertStatus(429);
    }
}

<?php

namespace Tests\Feature\Report;

use App\Enums\OpportunityStage;
use App\Enums\PropertyStatus;
use App\Enums\UserRole;
use App\Models\Opportunity;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_access_reports(): void
    {
        $this->getJson('/api/v1/reports/properties-by-status')->assertStatus(401);
        $this->getJson('/api/v1/reports/closings-by-period')->assertStatus(401);
        $this->getJson('/api/v1/reports/agent-performance')->assertStatus(401);
    }

    public function test_asistente_can_view_reports_since_read_access_is_intentionally_unrestricted(): void
    {
        $asistente = User::factory()->create(['role' => UserRole::Asistente]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($asistente));

        $this->getJson('/api/v1/reports/properties-by-status')->assertOk();
        $this->getJson('/api/v1/reports/closings-by-period')->assertOk();
        $this->getJson('/api/v1/reports/agent-performance')->assertOk();
    }

    public function test_properties_by_status_report_groups_and_sums_correctly(): void
    {
        $this->actingUser();
        Property::factory(2)->create(['status' => PropertyStatus::Disponible, 'price' => 100_000_000]);
        Property::factory(1)->create(['status' => PropertyStatus::Vendido, 'price' => 200_000_000]);

        $response = $this->getJson('/api/v1/reports/properties-by-status');

        $response->assertOk();
        $rows = collect($response->json('data'));
        $available = $rows->firstWhere('status', 'disponible');
        $sold = $rows->firstWhere('status', 'vendido');

        $this->assertSame(2, $available['count']);
        $this->assertSame(200_000_000.0, (float) $available['total_value']);
        $this->assertSame(1, $sold['count']);
        $this->assertSame(200_000_000.0, (float) $sold['total_value']);
    }

    public function test_closings_by_period_report_only_counts_recent_closed_deals(): void
    {
        $this->actingUser();

        $thisMonth = Opportunity::factory()->create(['stage' => OpportunityStage::CierreGanado, 'property_id' => null, 'value' => 50_000_000]);
        $thisMonth->forceFill(['closed_at' => now()])->save();

        $tooOld = Opportunity::factory()->create(['stage' => OpportunityStage::CierrePerdido, 'property_id' => null]);
        $tooOld->forceFill(['closed_at' => now()->subMonths(12)])->save();

        $response = $this->getJson('/api/v1/reports/closings-by-period?months=6');

        $response->assertOk();
        $rows = collect($response->json('data'));
        $this->assertCount(6, $rows);

        $totalWon = $rows->sum('won_count');
        $totalWonValue = (float) $rows->sum('won_value');
        $this->assertSame(1, $totalWon);
        $this->assertSame(50_000_000.0, $totalWonValue);
        $this->assertSame(0, $rows->sum('lost_count'));
    }

    public function test_agent_performance_report_excludes_asistente_role(): void
    {
        $this->actingUser();
        $agent = User::factory()->create(['role' => UserRole::Agente, 'name' => 'Agente Uno']);
        User::factory()->create(['role' => UserRole::Asistente, 'name' => 'Asistente Uno']);

        Property::factory(2)->create(['agent_id' => $agent->id]);
        $won = Opportunity::factory()->create(['agent_id' => $agent->id, 'stage' => OpportunityStage::CierreGanado, 'property_id' => null, 'value' => 75_000_000]);
        $won->forceFill(['closed_at' => now()])->save();

        $response = $this->getJson('/api/v1/reports/agent-performance');

        $response->assertOk();
        $rows = collect($response->json('data'));
        $names = $rows->pluck('agent');

        $this->assertContains('Agente Uno', $names);
        $this->assertNotContains('Asistente Uno', $names);

        $row = $rows->firstWhere('agent', 'Agente Uno');
        $this->assertSame(2, $row['properties_count']);
        $this->assertSame(1, $row['closed_count']);
        $this->assertSame(75_000_000.0, (float) $row['closed_value']);
    }

    public function test_properties_by_agent_status_groups_per_agent_and_status(): void
    {
        $this->actingUser();
        $agent = User::factory()->create(['role' => UserRole::Agente, 'name' => 'Agente Uno']);
        Property::factory(2)->create(['agent_id' => $agent->id, 'status' => PropertyStatus::Disponible]);
        Property::factory(1)->create(['agent_id' => $agent->id, 'status' => PropertyStatus::Vendido]);
        Property::factory(1)->create(['agent_id' => null]); // sin agente, no debe romper ni contar aparte incorrectamente

        $response = $this->getJson('/api/v1/reports/properties-by-agent-status');

        $response->assertOk();
        $rows = collect($response->json('data'));
        $this->assertCount(1, $rows);

        $row = $rows->first();
        $this->assertSame('Agente Uno', $row['agent']);
        $this->assertSame(2, $row['disponible']);
        $this->assertSame(1, $row['vendido']);
        $this->assertSame(0, $row['reservado']);
    }

    public function test_can_export_a_report_as_csv(): void
    {
        $this->actingUser();
        Property::factory(2)->create();

        $response = $this->get('/api/v1/reports/properties-by-status?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

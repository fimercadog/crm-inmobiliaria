<?php

namespace Tests\Feature\Dashboard;

use App\Enums\LeadStatus;
use App\Enums\OpportunityStage;
use App\Enums\PropertyStatus;
use App\Enums\TaskStatus;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Property;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create();
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_view_dashboard_summary(): void
    {
        $this->getJson('/api/v1/dashboard/summary')->assertStatus(401);
    }

    public function test_summary_reflects_real_counts(): void
    {
        $this->actingUser();

        Property::factory(3)->create(['status' => PropertyStatus::Disponible]);
        Property::factory(2)->create(['status' => PropertyStatus::Vendido]);
        Lead::factory(4)->create(['status' => LeadStatus::Nuevo]);
        Task::factory(2)->create(['status' => TaskStatus::Pendiente]);
        // property_id pinned to null: OpportunityFactory has a 70% chance of nested-creating
        // a Property with a random status otherwise, which flakily inflates the property
        // status counts asserted below.
        Opportunity::factory()->create(['stage' => OpportunityStage::Negociacion, 'value' => 100, 'property_id' => null]);
        Opportunity::factory()->create(['stage' => OpportunityStage::CierreGanado, 'value' => 200, 'property_id' => null]);

        $response = $this->getJson('/api/v1/dashboard/summary');

        $response->assertOk()
            ->assertJsonPath('data.properties.available', 3)
            ->assertJsonPath('data.properties.sold', 2)
            ->assertJsonPath('data.leads_new', 4)
            ->assertJsonPath('data.tasks_pending', 2)
            ->assertJsonPath('data.deals_in_negotiation', 1)
            ->assertJsonPath('data.closings_this_month', 1);

        $this->assertSame(100.0, (float) $response->json('data.pipeline_value'));

        $funnel = collect($response->json('data.funnel'));
        $this->assertSame(4, $funnel->firstWhere('stage', 'lead')['count']);
        $this->assertSame(1, $funnel->firstWhere('stage', 'negociacion')['count']);
        $this->assertSame(1, $funnel->firstWhere('stage', 'cierre')['count']);
    }
}

<?php

namespace Tests\Feature\Agent;

use App\Enums\OpportunityStage;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Opportunity;
use App\Models\Property;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgentTest extends TestCase
{
    use RefreshDatabase;

    private function actingAdmin(): User
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($admin));

        return $admin;
    }

    public function test_guest_cannot_list_agents(): void
    {
        $this->getJson('/api/v1/agents')->assertStatus(401);
    }

    public function test_non_admin_cannot_list_agents(): void
    {
        $agent = User::factory()->create(['role' => UserRole::Agente]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($agent));

        $this->getJson('/api/v1/agents')->assertStatus(403);
    }

    public function test_admin_can_list_agents_with_workload_counts(): void
    {
        $this->actingAdmin();
        $agent = User::factory()->create(['role' => UserRole::Agente]);
        User::factory()->create(['role' => UserRole::Asistente]);

        Property::factory(2)->create(['agent_id' => $agent->id]);
        Opportunity::factory()->create(['agent_id' => $agent->id, 'stage' => OpportunityStage::Nuevo, 'property_id' => null]);
        Task::factory()->create(['agent_id' => $agent->id, 'status' => TaskStatus::Pendiente]);

        $response = $this->getJson('/api/v1/agents');

        $response->assertOk();
        $agentRow = collect($response->json('data.items'))->firstWhere('id', $agent->id);

        $this->assertNotNull($agentRow);
        $this->assertSame(2, $agentRow['properties_count']);
        $this->assertSame(1, $agentRow['open_opportunities_count']);
        $this->assertSame(1, $agentRow['pending_tasks_count']);
    }

    public function test_asistente_role_is_excluded_from_agents_list(): void
    {
        $this->actingAdmin();
        $asistente = User::factory()->create(['role' => UserRole::Asistente, 'name' => 'No es agente']);

        $response = $this->getJson('/api/v1/agents');

        $response->assertOk();
        $ids = collect($response->json('data.items'))->pluck('id');
        $this->assertNotContains($asistente->id, $ids);
    }
}

<?php

namespace Tests\Feature\Contingency;

use App\Enums\UserRole;
use App\Models\Activity;
use App\Models\ContingencySession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContingencyTest extends TestCase
{
    use RefreshDatabase;

    private function loginAs(UserRole $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));

        return $user;
    }

    public function test_status_reports_inactive_when_no_session_exists(): void
    {
        $this->loginAs(UserRole::Asistente);

        $this->getJson('/api/v1/contingency/status')
            ->assertOk()
            ->assertJsonPath('data.active', false);
    }

    public function test_modules_endpoint_lists_the_eligible_registry(): void
    {
        $this->loginAs(UserRole::Admin);

        $this->getJson('/api/v1/contingency/modules')
            ->assertOk()
            ->assertJsonFragment(['key' => 'activities']);
    }

    public function test_only_admin_can_activate_contingency(): void
    {
        $this->loginAs(UserRole::Agente);

        $this->postJson('/api/v1/contingency/activate', ['enabled_modules' => ['activities']])
            ->assertForbidden();

        $this->assertDatabaseCount('contingency_sessions', 0);
    }

    public function test_admin_can_activate_contingency_with_eligible_modules(): void
    {
        $admin = $this->loginAs(UserRole::Admin);

        $response = $this->postJson('/api/v1/contingency/activate', ['enabled_modules' => ['activities']]);

        $response->assertCreated()->assertJsonPath('data.enabled_modules', ['activities']);
        $this->assertDatabaseHas('contingency_sessions', [
            'status' => 'active',
            'activated_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('contingency_events', ['type' => 'activated']);
    }

    public function test_cannot_activate_an_ineligible_module(): void
    {
        $this->loginAs(UserRole::Admin);

        $this->postJson('/api/v1/contingency/activate', ['enabled_modules' => ['properties']])
            ->assertStatus(422);
    }

    public function test_cannot_activate_when_a_session_is_already_active(): void
    {
        $this->loginAs(UserRole::Admin);
        $this->postJson('/api/v1/contingency/activate', ['enabled_modules' => ['activities']])->assertCreated();

        $this->postJson('/api/v1/contingency/activate', ['enabled_modules' => ['activities']])
            ->assertStatus(409);
    }

    public function test_only_admin_can_deactivate_contingency(): void
    {
        ContingencySession::create([
            'enabled_modules' => ['activities'],
            'activated_by' => User::factory()->create(['role' => UserRole::Admin])->id,
            'activated_at' => now(),
            'status' => 'active',
        ]);
        $this->loginAs(UserRole::Agente);

        $this->postJson('/api/v1/contingency/deactivate')->assertForbidden();
    }

    public function test_admin_can_deactivate_an_active_session(): void
    {
        $session = ContingencySession::create([
            'enabled_modules' => ['activities'],
            'activated_by' => User::factory()->create(['role' => UserRole::Admin])->id,
            'activated_at' => now(),
            'status' => 'active',
        ]);
        $admin = $this->loginAs(UserRole::Admin);

        $this->postJson('/api/v1/contingency/deactivate')
            ->assertOk()
            ->assertJsonPath('data.status', 'closed');

        $this->assertDatabaseHas('contingency_sessions', ['id' => $session->id, 'status' => 'closed']);
        $this->assertDatabaseHas('contingency_events', ['type' => 'deactivated', 'user_id' => $admin->id]);
    }

    public function test_syncing_an_activity_with_the_same_client_uuid_twice_does_not_duplicate_it(): void
    {
        $this->loginAs(UserRole::Agente);
        $uuid = '550e8400-e29b-41d4-a716-446655440000';
        $payload = [
            'type' => 'llamada',
            'notes' => 'Nota registrada en contingencia',
            'occurred_at' => now()->toIso8601String(),
            'client_uuid' => $uuid,
        ];

        $this->postJson('/api/v1/activities', $payload)->assertCreated();
        $this->postJson('/api/v1/activities', $payload)->assertCreated();

        $this->assertSame(1, Activity::query()->where('client_uuid', $uuid)->count());
    }
}

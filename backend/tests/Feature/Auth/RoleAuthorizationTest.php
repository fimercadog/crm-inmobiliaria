<?php

namespace Tests\Feature\Auth;

use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use App\Enums\UserRole;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateAs(UserRole $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));

        return $user;
    }

    private function propertyPayload(): array
    {
        return [
            'title' => 'Casa de prueba',
            'property_type' => PropertyType::Casa->value,
            'listing_type' => 'venta',
            'status' => PropertyStatus::Disponible->value,
            'price' => 100000,
            'city' => 'Bogotá',
            'address' => 'Calle Falsa 123',
        ];
    }

    public function test_asistente_cannot_create_a_property(): void
    {
        $this->authenticateAs(UserRole::Asistente);

        $this->postJson('/api/v1/properties', $this->propertyPayload())
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_asistente_cannot_update_a_property(): void
    {
        $this->authenticateAs(UserRole::Asistente);
        $property = Property::factory()->create();

        $this->putJson("/api/v1/properties/{$property->id}", $this->propertyPayload())
            ->assertStatus(403);
    }

    public function test_asistente_cannot_delete_a_property(): void
    {
        $this->authenticateAs(UserRole::Asistente);
        $property = Property::factory()->create();

        $this->deleteJson("/api/v1/properties/{$property->id}")->assertStatus(403);
    }

    public function test_asistente_can_still_view_properties(): void
    {
        $this->authenticateAs(UserRole::Asistente);
        Property::factory(3)->create();

        $this->getJson('/api/v1/properties')->assertOk();
    }

    public function test_agente_can_create_and_update_a_property(): void
    {
        $this->authenticateAs(UserRole::Agente);
        $property = Property::factory()->create();

        $this->postJson('/api/v1/properties', $this->propertyPayload())->assertCreated();
        $this->putJson("/api/v1/properties/{$property->id}", $this->propertyPayload())->assertOk();
    }

    public function test_agente_cannot_delete_a_property(): void
    {
        $this->authenticateAs(UserRole::Agente);
        $property = Property::factory()->create();

        $this->deleteJson("/api/v1/properties/{$property->id}")->assertStatus(403);
    }

    public function test_admin_can_create_update_and_delete_a_property(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();

        $this->postJson('/api/v1/properties', $this->propertyPayload())->assertCreated();
        $this->putJson("/api/v1/properties/{$property->id}", $this->propertyPayload())->assertOk();
        $this->deleteJson("/api/v1/properties/{$property->id}")->assertOk();
    }

    public function test_login_response_includes_the_user_role(): void
    {
        User::factory()->create(['email' => 'agente@test.com', 'password' => 'password', 'role' => UserRole::Agente]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'agente@test.com',
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('data.user.role', UserRole::Agente->value);
    }

    public function test_admin_can_list_users(): void
    {
        $this->authenticateAs(UserRole::Admin);
        User::factory(3)->create();

        $this->getJson('/api/v1/users')->assertOk();
    }

    public function test_agente_cannot_list_users(): void
    {
        $this->authenticateAs(UserRole::Agente);

        $this->getJson('/api/v1/users')->assertStatus(403);
    }

    public function test_asistente_cannot_list_users(): void
    {
        $this->authenticateAs(UserRole::Asistente);

        $this->getJson('/api/v1/users')->assertStatus(403);
    }

    public function test_admin_can_create_a_user(): void
    {
        $this->authenticateAs(UserRole::Admin);

        $response = $this->postJson('/api/v1/users', [
            'name' => 'Nuevo Agente',
            'email' => 'nuevo.agente@crm.test',
            'password' => 'password123',
            'role' => UserRole::Agente->value,
        ]);

        $response->assertCreated()->assertJsonPath('data.role', UserRole::Agente->value);
        $this->assertDatabaseHas('users', ['email' => 'nuevo.agente@crm.test', 'role' => UserRole::Agente->value]);
    }

    public function test_admin_can_update_another_users_role(): void
    {
        $admin = $this->authenticateAs(UserRole::Admin);
        $target = User::factory()->create(['role' => UserRole::Asistente]);

        $response = $this->putJson("/api/v1/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'role' => UserRole::Agente->value,
        ]);

        $response->assertOk()->assertJsonPath('data.role', UserRole::Agente->value);
        $this->assertNotSame($admin->id, $target->id);
    }

    public function test_admin_can_delete_another_user(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $target = User::factory()->create();

        $this->deleteJson("/api/v1/users/{$target->id}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $admin = $this->authenticateAs(UserRole::Admin);

        $this->deleteJson("/api/v1/users/{$admin->id}")->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_cannot_change_their_own_role(): void
    {
        $admin = $this->authenticateAs(UserRole::Admin);

        $response = $this->putJson("/api/v1/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => UserRole::Agente->value,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $admin->id, 'role' => UserRole::Admin->value]);
    }

    public function test_admin_can_update_their_own_name_without_changing_role(): void
    {
        $admin = $this->authenticateAs(UserRole::Admin);

        $response = $this->putJson("/api/v1/users/{$admin->id}", [
            'name' => 'Nombre actualizado',
            'email' => $admin->email,
            'role' => UserRole::Admin->value,
        ]);

        $response->assertOk()->assertJsonPath('data.name', 'Nombre actualizado');
    }
}

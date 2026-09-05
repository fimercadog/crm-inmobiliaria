<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', $user->email)
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email']]])
            // The JWT must travel only as an httpOnly cookie, never in the
            // JSON body — a body token would be just as readable by an XSS
            // payload as the localStorage copy this migration removes.
            ->assertJsonMissingPath('data.token');

        $cookie = $response->getCookie(config('jwt.cookie_key_name', 'token'), decrypt: false);
        $this->assertNotNull($cookie, 'Login response must set the auth cookie.');
        $this->assertTrue($cookie->isHttpOnly(), 'Auth cookie must be httpOnly.');
    }

    public function test_login_cookie_authenticates_subsequent_requests_without_a_bearer_header(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $token = $login->getCookie(config('jwt.cookie_key_name', 'token'))->getValue();

        $this->withCookie(config('jwt.cookie_key_name', 'token'), $token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_logout_clears_the_auth_cookie(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');

        $response->assertOk();
        $cookie = $response->getCookie(config('jwt.cookie_key_name', 'token'), decrypt: false);
        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->getExpiresTime() > 0 && $cookie->getExpiresTime() < time(), 'Logout must expire the auth cookie.');
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_fetch_their_profile(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);
        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $response->assertOk()->assertJsonPath('data.email', $user->email);
    }

    public function test_guest_cannot_fetch_profile(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_update_their_profile(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin, 'name' => 'Nombre viejo']);
        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/auth/profile', [
                'name' => 'Nombre nuevo',
                'email' => $user->email,
            ]);

        $response->assertOk()->assertJsonPath('data.name', 'Nombre nuevo');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Nombre nuevo']);
    }

    public function test_updating_profile_without_password_keeps_the_existing_one(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin, 'password' => 'password']);
        $token = auth('api')->login($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/auth/profile', [
                'name' => $user->name,
                'email' => $user->email,
            ])->assertOk();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk();
    }

    public function test_updating_profile_with_a_new_password_requires_the_current_password(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin, 'password' => 'password']);
        $token = auth('api')->login($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/auth/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'password' => 'nueva-clave-segura',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_updating_profile_with_a_wrong_current_password_is_rejected(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin, 'password' => 'password']);
        $token = auth('api')->login($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/auth/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'password' => 'nueva-clave-segura',
                'current_password' => 'clave-incorrecta',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_updating_profile_with_a_new_password_and_correct_current_password_replaces_it(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin, 'password' => 'password']);
        $token = auth('api')->login($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/auth/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'password' => 'nueva-clave-segura',
                'current_password' => 'password',
            ])->assertOk();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(401);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'nueva-clave-segura',
        ])->assertOk();
    }
}

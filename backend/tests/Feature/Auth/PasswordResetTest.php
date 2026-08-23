<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_a_reset_notification_for_a_known_email(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'known@crm.test']);

        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'known@crm.test']);

        $response->assertOk()->assertJsonPath('success', true);
        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_forgot_password_returns_the_same_generic_message_for_an_unknown_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'nobody@crm.test']);

        $response->assertOk()->assertJsonPath('success', true);
        Notification::assertNothingSent();
    }

    public function test_forgot_password_requires_a_valid_email(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_reset_their_password_with_a_valid_token(): void
    {
        $user = User::factory()->create(['email' => 'reset@crm.test', 'password' => 'old-password']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'reset@crm.test',
            'token' => $token,
            'password' => 'new-password-123',
        ]);

        $response->assertOk()->assertJsonPath('success', true);

        $this->postJson('/api/v1/auth/login', ['email' => 'reset@crm.test', 'password' => 'old-password'])
            ->assertStatus(401);

        $this->postJson('/api/v1/auth/login', ['email' => 'reset@crm.test', 'password' => 'new-password-123'])
            ->assertOk();
    }

    public function test_reset_password_rejects_an_invalid_token(): void
    {
        $user = User::factory()->create(['email' => 'reset2@crm.test', 'password' => 'old-password']);
        Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'reset2@crm.test',
            'token' => 'a-completely-invalid-token',
            'password' => 'new-password-123',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);

        $this->postJson('/api/v1/auth/login', ['email' => 'reset2@crm.test', 'password' => 'old-password'])
            ->assertOk();
    }

    public function test_reset_password_requires_minimum_length(): void
    {
        $user = User::factory()->create(['email' => 'reset3@crm.test']);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'reset3@crm.test',
            'token' => $token,
            'password' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors(['password']);
    }
}

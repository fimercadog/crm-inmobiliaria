<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function attempt(string $email, string $password): ?string
    {
        $token = Auth::guard('api')->attempt([
            'email' => $email,
            'password' => $password,
        ]);

        return $token ?: null;
    }

    public function currentUser(): ?User
    {
        return Auth::guard('api')->user();
    }

    public function logout(): void
    {
        Auth::guard('api')->logout();
    }

    public function refresh(): string
    {
        return JWTAuth::refresh(JWTAuth::getToken());
    }

    /**
     * @return array{token: string, type: string, expires_in: int}
     */
    public function tokenPayload(string $token): array
    {
        return [
            'token' => $token,
            'type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
        ];
    }
}

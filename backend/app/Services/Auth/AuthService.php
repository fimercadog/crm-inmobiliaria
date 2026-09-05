<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Cookie;

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

    public function updateProfile(User $user, array $data): User
    {
        unset($data['current_password']);

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $user;
    }

    public function sendPasswordResetLink(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    public function resetPassword(string $email, string $token, string $password): string
    {
        return Password::reset(
            ['email' => $email, 'token' => $token, 'password' => $password],
            function (User $user, string $password): void {
                $user->forceFill(['password' => Hash::make($password)])->save();
            },
        );
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
     * @return array{type: string, expires_in: int}
     */
    public function tokenPayload(): array
    {
        return [
            'type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
        ];
    }

    // The JWT travels only as an httpOnly cookie now, never in the JSON body
    // or in an Authorization header the frontend has to store itself — a
    // token readable from JS (localStorage, or even a JSON response body) is
    // just as stealable by an XSS payload as one sitting in localStorage.
    // `secure` mirrors the current request's own scheme so it works over
    // plain http in local dev and requires https once deployed.
    public function makeAuthCookie(string $token, Request $request): Cookie
    {
        return cookie(
            name: config('jwt.cookie_key_name', 'token'),
            value: $token,
            minutes: Auth::guard('api')->factory()->getTTL(),
            path: '/',
            domain: null,
            secure: $request->secure(),
            httpOnly: true,
            raw: false,
            sameSite: config('session.same_site', 'lax'),
        );
    }

    public function forgetAuthCookie(): Cookie
    {
        return cookie()->forget(config('jwt.cookie_key_name', 'token'));
    }
}

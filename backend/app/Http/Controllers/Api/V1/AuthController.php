<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $token = $this->authService->attempt(
            $request->validated('email'),
            $request->validated('password'),
        );

        if (! $token) {
            return ApiResponse::error('Credenciales inválidas', null, 401);
        }

        return ApiResponse::success([
            ...$this->authService->tokenPayload($token),
            'user' => new UserResource($this->authService->currentUser()),
        ], 'Sesión iniciada correctamente');
    }

    public function me(): JsonResponse
    {
        return ApiResponse::success(new UserResource($this->authService->currentUser()));
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->authService->updateProfile($this->authService->currentUser(), $request->validated());

        return ApiResponse::success(new UserResource($user), 'Perfil actualizado correctamente');
    }

    public function refresh(): JsonResponse
    {
        return ApiResponse::success($this->authService->tokenPayload($this->authService->refresh()), 'Token renovado');
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return ApiResponse::success(null, 'Sesión cerrada correctamente');
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

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

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordResetLink($request->validated('email'));

        // Always return the same message regardless of the broker's outcome
        // so this endpoint can't be used to enumerate registered emails.
        return ApiResponse::success(null, 'Si el correo existe, enviaremos un enlace para restablecer la contraseña');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = $this->authService->resetPassword(
            $request->validated('email'),
            $request->validated('token'),
            $request->validated('password'),
        );

        if ($status !== Password::PASSWORD_RESET) {
            return ApiResponse::error('El enlace de restablecimiento no es válido o expiró', null, 422);
        }

        return ApiResponse::success(null, 'Contraseña actualizada correctamente');
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

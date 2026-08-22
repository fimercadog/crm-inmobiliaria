<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $paginator = $this->userService->paginate($request);

        return ApiResponse::paginated(UserResource::collection($paginator));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = $this->userService->create($request->validated());

        return ApiResponse::success(new UserResource($user), 'Usuario creado correctamente', Response::HTTP_CREATED);
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return ApiResponse::success(new UserResource($user));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        if ($user->is($request->user()) && $request->validated('role') !== $user->role->value) {
            return ApiResponse::error('No puedes cambiar tu propio rol', null, Response::HTTP_FORBIDDEN);
        }

        $this->userService->update($user, $request->validated());

        return ApiResponse::success(new UserResource($user), 'Usuario actualizado correctamente');
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->userService->delete($user);

        return ApiResponse::success(null, 'Usuario eliminado correctamente');
    }
}

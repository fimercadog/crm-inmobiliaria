<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgentResource;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Services\User\AgentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    public function __construct(private readonly AgentService $agentService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $paginator = $this->agentService->paginate($request);

        return ApiResponse::paginated(AgentResource::collection($paginator));
    }
}

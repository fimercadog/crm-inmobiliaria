<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\PublicPropertyDetailResource;
use App\Http\Resources\Public\PublicPropertyResource;
use App\Http\Responses\ApiResponse;
use App\Models\Property;
use App\Services\Property\PublicPropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicPropertyController extends Controller
{
    public function __construct(private readonly PublicPropertyService $propertyService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->propertyService->paginate($request);

        return ApiResponse::paginated(PublicPropertyResource::collection($paginator));
    }

    public function featured(): JsonResponse
    {
        return ApiResponse::success(PublicPropertyResource::collection($this->propertyService->featured()));
    }

    public function show(Property $property): JsonResponse
    {
        abort_unless($property->isPublished(), 404);

        return ApiResponse::success(new PublicPropertyDetailResource($property->load(['images', 'agent'])));
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StorePublicLeadRequest;
use App\Http\Responses\ApiResponse;
use App\Services\Lead\PublicLeadService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class PublicLeadController extends Controller
{
    public function __construct(private readonly PublicLeadService $leadService) {}

    public function store(StorePublicLeadRequest $request): JsonResponse
    {
        $this->leadService->create($request->validated());

        return ApiResponse::success(null, 'Gracias por tu mensaje. Un asesor se pondrá en contacto contigo pronto.', Response::HTTP_CREATED);
    }
}

<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'Operación realizada correctamente', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function paginated(LengthAwarePaginator|AnonymousResourceCollection $paginator, string $message = 'Operación realizada correctamente'): JsonResponse
    {
        $resource = $paginator instanceof AnonymousResourceCollection ? $paginator->resource : $paginator;

        return static::success([
            'items' => $paginator instanceof AnonymousResourceCollection ? $paginator->collection : $resource->items(),
            'meta' => [
                'current_page' => $resource->currentPage(),
                'last_page' => $resource->lastPage(),
                'per_page' => $resource->perPage(),
                'total' => $resource->total(),
            ],
        ], $message);
    }

    public static function error(string $message = 'No fue posible completar la operación', mixed $errors = null, int $status = 422): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}

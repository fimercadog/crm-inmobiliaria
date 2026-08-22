<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PropertyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/ping', fn () => response()->json([
        'success' => true,
        'message' => 'pong',
        'data' => null,
    ]));

    Route::prefix('auth')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:api')->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/properties/export', [PropertyController::class, 'export']);
        Route::apiResource('properties', PropertyController::class);
    });
});

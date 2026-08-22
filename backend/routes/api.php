<?php

use App\Http\Controllers\Api\V1\ActivityController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\OpportunityController;
use App\Http\Controllers\Api\V1\OwnerController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\VisitController;
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
        Route::get('/properties/options', [PropertyController::class, 'options']);
        Route::apiResource('properties', PropertyController::class);

        Route::get('/owners/export', [OwnerController::class, 'export']);
        Route::get('/owners/options', [OwnerController::class, 'options']);
        Route::apiResource('owners', OwnerController::class);

        Route::get('/clients/export', [ClientController::class, 'export']);
        Route::get('/clients/options', [ClientController::class, 'options']);
        Route::apiResource('clients', ClientController::class);

        Route::get('/leads/export', [LeadController::class, 'export']);
        Route::post('/leads/{lead}/convert', [LeadController::class, 'convert']);
        Route::apiResource('leads', LeadController::class);

        Route::get('/opportunities/export', [OpportunityController::class, 'export']);
        Route::apiResource('opportunities', OpportunityController::class);

        Route::get('/visits/export', [VisitController::class, 'export']);
        Route::apiResource('visits', VisitController::class);

        Route::get('/activities/export', [ActivityController::class, 'export']);
        Route::apiResource('activities', ActivityController::class);

        Route::get('/tasks/export', [TaskController::class, 'export']);
        Route::apiResource('tasks', TaskController::class);
    });
});

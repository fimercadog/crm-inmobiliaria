<?php

use App\Http\Controllers\Api\V1\ActivityController;
use App\Http\Controllers\Api\V1\AgentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlogPostController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\OpportunityController;
use App\Http\Controllers\Api\V1\OwnerController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\PropertyImageController;
use App\Http\Controllers\Api\V1\Public\PublicBlogController;
use App\Http\Controllers\Api\V1\Public\PublicLeadController;
use App\Http\Controllers\Api\V1\Public\PublicPropertyController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
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
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

        Route::middleware('auth:api')->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    Route::prefix('public')->group(function (): void {
        Route::middleware('throttle:60,1')->group(function (): void {
            Route::get('/properties/featured', [PublicPropertyController::class, 'featured']);
            Route::get('/properties/{property:slug}', [PublicPropertyController::class, 'show']);
            Route::get('/properties', [PublicPropertyController::class, 'index']);

            Route::get('/blog/{post:slug}', [PublicBlogController::class, 'show']);
            Route::get('/blog', [PublicBlogController::class, 'index']);
        });

        Route::post('/leads', [PublicLeadController::class, 'store'])->middleware('throttle:10,1');
    });

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

        Route::get('/properties/export', [PropertyController::class, 'export']);
        Route::get('/properties/options', [PropertyController::class, 'options']);
        Route::apiResource('properties', PropertyController::class);

        Route::post('/properties/{property}/images', [PropertyImageController::class, 'store']);
        Route::patch('/properties/{property}/images/{image}', [PropertyImageController::class, 'update']);
        Route::delete('/properties/{property}/images/{image}', [PropertyImageController::class, 'destroy']);

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
        Route::get('/opportunities/closed', [OpportunityController::class, 'closed']);
        Route::get('/opportunities/closed/export', [OpportunityController::class, 'exportClosed']);
        Route::apiResource('opportunities', OpportunityController::class);

        Route::get('/visits/export', [VisitController::class, 'export']);
        Route::apiResource('visits', VisitController::class);

        Route::get('/activities/export', [ActivityController::class, 'export']);
        Route::apiResource('activities', ActivityController::class);

        Route::get('/tasks/export', [TaskController::class, 'export']);
        Route::apiResource('tasks', TaskController::class);

        Route::apiResource('users', UserController::class);
        Route::get('/agents', [AgentController::class, 'index']);

        Route::prefix('reports')->group(function (): void {
            Route::get('/properties-by-status', [ReportController::class, 'propertiesByStatus']);
            Route::get('/closings-by-period', [ReportController::class, 'closingsByPeriod']);
            Route::get('/agent-performance', [ReportController::class, 'agentPerformance']);
        });

        Route::get('/documents', [DocumentController::class, 'index']);
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
        Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);

        Route::get('/blog-posts/export', [BlogPostController::class, 'export']);
        Route::post('/blog-posts/{post}/cover-image', [BlogPostController::class, 'storeCoverImage']);
        Route::apiResource('blog-posts', BlogPostController::class)->parameters(['blog-posts' => 'post']);
    });
});

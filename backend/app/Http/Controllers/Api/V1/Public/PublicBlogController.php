<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\PublicBlogPostDetailResource;
use App\Http\Resources\Public\PublicBlogPostResource;
use App\Http\Responses\ApiResponse;
use App\Models\BlogPost;
use App\Services\Blog\PublicBlogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    public function __construct(private readonly PublicBlogService $blogService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->blogService->paginate($request);

        return ApiResponse::paginated(PublicBlogPostResource::collection($paginator));
    }

    public function show(BlogPost $post): JsonResponse
    {
        abort_unless($post->isPublished(), 404);

        return ApiResponse::success(new PublicBlogPostDetailResource($post->load('author')));
    }
}

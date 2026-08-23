<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blog\StoreBlogPostRequest;
use App\Http\Requests\Blog\StoreCoverImageRequest;
use App\Http\Requests\Blog\UpdateBlogPostRequest;
use App\Http\Resources\BlogPostResource;
use App\Http\Responses\ApiResponse;
use App\Models\BlogPost;
use App\Services\Blog\BlogPostService;
use App\Services\Export\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class BlogPostController extends Controller
{
    private const EXPORT_COLUMNS = [
        'title' => 'Título',
        'status' => 'Estado',
        'author' => 'Autor',
        'published_at' => 'Fecha de publicación',
    ];

    public function __construct(
        private readonly BlogPostService $blogPostService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->blogPostService->paginate($request);

        return ApiResponse::paginated(BlogPostResource::collection($paginator));
    }

    public function store(StoreBlogPostRequest $request): JsonResponse
    {
        $this->authorize('create', BlogPost::class);

        $post = $this->blogPostService->create($request->validated(), $request->user());

        return ApiResponse::success(new BlogPostResource($post->load('author')), 'Artículo creado correctamente', Response::HTTP_CREATED);
    }

    public function show(BlogPost $post): JsonResponse
    {
        return ApiResponse::success(new BlogPostResource($post->load('author')));
    }

    public function update(UpdateBlogPostRequest $request, BlogPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        $this->blogPostService->update($post, $request->validated());

        return ApiResponse::success(new BlogPostResource($post->load('author')), 'Artículo actualizado correctamente');
    }

    public function destroy(BlogPost $post): JsonResponse
    {
        $this->authorize('delete', $post);

        $this->blogPostService->delete($post);

        return ApiResponse::success(null, 'Artículo eliminado correctamente');
    }

    public function storeCoverImage(StoreCoverImageRequest $request, BlogPost $post): JsonResponse
    {
        $this->authorize('update', $post);

        if ($post->cover_image) {
            Storage::disk('public')->delete($post->cover_image);
        }

        $path = $request->file('file')->store('blog-covers', 'public');
        $post->update(['cover_image' => $path]);

        return ApiResponse::success(new BlogPostResource($post->load('author')), 'Imagen de portada actualizada');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->blogPostService->forExport($request)->map(fn (BlogPost $post) => [
            'title' => $post->title,
            'status' => $post->status->value,
            'author' => $post->author?->name ?? '—',
            'published_at' => $post->published_at?->format('d/m/Y') ?? '—',
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'blog', 'Blog')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'blog');
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Http\Responses\ApiResponse;
use App\Models\Document;
use App\Services\Document\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function __construct(private readonly DocumentService $documentService) {}

    public function index(Request $request): JsonResponse
    {
        $documents = $this->documentService->forSubject($request);

        return ApiResponse::success(DocumentResource::collection($documents));
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $this->authorize('create', Document::class);

        $document = $this->documentService->upload(
            $request->file('file'),
            $request->validated('subject_type'),
            (int) $request->validated('subject_id'),
            $request->user()?->id,
        );

        return ApiResponse::success(new DocumentResource($document), 'Documento cargado correctamente', Response::HTTP_CREATED);
    }

    public function download(Document $document): StreamedResponse
    {
        return Storage::disk('local')->download($document->path, $document->name);
    }

    public function destroy(Document $document): JsonResponse
    {
        $this->authorize('delete', $document);

        $this->documentService->delete($document);

        return ApiResponse::success(null, 'Documento eliminado correctamente');
    }
}

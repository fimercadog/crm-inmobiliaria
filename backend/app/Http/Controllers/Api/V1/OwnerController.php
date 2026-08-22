<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreOwnerRequest;
use App\Http\Requests\Owner\UpdateOwnerRequest;
use App\Http\Resources\OwnerResource;
use App\Http\Responses\ApiResponse;
use App\Models\Owner;
use App\Services\Export\ExportService;
use App\Services\Owner\OwnerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OwnerController extends Controller
{
    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'document' => 'Documento',
        'phone' => 'Teléfono',
        'email' => 'Correo',
        'status' => 'Estado',
        'properties_count' => 'Propiedades',
    ];

    public function __construct(
        private readonly OwnerService $ownerService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->ownerService->paginate($request);

        return ApiResponse::paginated(OwnerResource::collection($paginator));
    }

    public function options(): JsonResponse
    {
        return ApiResponse::success($this->ownerService->forSelect());
    }

    public function store(StoreOwnerRequest $request): JsonResponse
    {
        $this->authorize('create', Owner::class);

        $owner = $this->ownerService->create($request->validated());

        return ApiResponse::success(new OwnerResource($owner), 'Propietario creado correctamente', Response::HTTP_CREATED);
    }

    public function show(Owner $owner): JsonResponse
    {
        return ApiResponse::success(new OwnerResource($owner->loadCount('properties')));
    }

    public function update(UpdateOwnerRequest $request, Owner $owner): JsonResponse
    {
        $this->authorize('update', $owner);

        $this->ownerService->update($owner, $request->validated());

        return ApiResponse::success(new OwnerResource($owner->loadCount('properties')), 'Propietario actualizado correctamente');
    }

    public function destroy(Owner $owner): JsonResponse
    {
        $this->authorize('delete', $owner);

        $this->ownerService->delete($owner);

        return ApiResponse::success(null, 'Propietario eliminado correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->ownerService->forExport($request)->map(fn (Owner $owner) => [
            'name' => $owner->name,
            'document' => $owner->document ?? '—',
            'phone' => $owner->phone ?? '—',
            'email' => $owner->email ?? '—',
            'status' => $owner->status->value,
            'properties_count' => (string) $owner->properties_count,
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'propietarios', 'Propietarios')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'propietarios');
    }
}

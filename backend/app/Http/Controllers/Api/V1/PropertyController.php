<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Responses\ApiResponse;
use App\Models\Property;
use App\Services\Export\ExportService;
use App\Services\Property\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PropertyController extends Controller
{
    private const EXPORT_COLUMNS = [
        'code' => 'Código',
        'title' => 'Título',
        'property_type' => 'Tipo',
        'listing_type' => 'Venta/Arriendo',
        'status' => 'Estado',
        'city' => 'Ciudad',
        'price' => 'Precio',
        'owner' => 'Propietario',
        'agent' => 'Agente',
    ];

    public function __construct(
        private readonly PropertyService $propertyService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->propertyService->paginate($request);

        return ApiResponse::paginated(PropertyResource::collection($paginator));
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $property = $this->propertyService->create($request->validated());

        return ApiResponse::success(new PropertyResource($property->load(['owner', 'agent'])), 'Propiedad creada correctamente', Response::HTTP_CREATED);
    }

    public function show(Property $property): JsonResponse
    {
        return ApiResponse::success(new PropertyResource($property->load(['owner', 'agent'])));
    }

    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $this->propertyService->update($property, $request->validated());

        return ApiResponse::success(new PropertyResource($property->load(['owner', 'agent'])), 'Propiedad actualizada correctamente');
    }

    public function destroy(Property $property): JsonResponse
    {
        $this->propertyService->delete($property);

        return ApiResponse::success(null, 'Propiedad eliminada correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->propertyService->forExport($request)->map(fn (Property $property) => [
            'code' => $property->code,
            'title' => $property->title,
            'property_type' => $property->property_type->value,
            'listing_type' => $property->listing_type->value,
            'status' => $property->status->value,
            'city' => $property->city,
            'price' => number_format((float) $property->price, 0, ',', '.'),
            'owner' => $property->owner?->name ?? '—',
            'agent' => $property->agent?->name ?? '—',
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'propiedades', 'Propiedades')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'propiedades');
    }
}

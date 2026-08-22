<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Visit\StoreVisitRequest;
use App\Http\Requests\Visit\UpdateVisitRequest;
use App\Http\Resources\VisitResource;
use App\Http\Responses\ApiResponse;
use App\Models\Visit;
use App\Services\Export\ExportService;
use App\Services\Visit\VisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VisitController extends Controller
{
    private const EXPORT_COLUMNS = [
        'property' => 'Propiedad',
        'client' => 'Cliente',
        'scheduled_at' => 'Fecha y hora',
        'status' => 'Estado',
    ];

    private const RELATIONS = ['property', 'client', 'agent'];

    public function __construct(
        private readonly VisitService $visitService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->visitService->paginate($request);

        return ApiResponse::paginated(VisitResource::collection($paginator));
    }

    public function store(StoreVisitRequest $request): JsonResponse
    {
        $visit = $this->visitService->create($request->validated());

        return ApiResponse::success(new VisitResource($visit->load(self::RELATIONS)), 'Visita agendada correctamente', Response::HTTP_CREATED);
    }

    public function show(Visit $visit): JsonResponse
    {
        return ApiResponse::success(new VisitResource($visit->load(self::RELATIONS)));
    }

    public function update(UpdateVisitRequest $request, Visit $visit): JsonResponse
    {
        $this->visitService->update($visit, $request->validated());

        return ApiResponse::success(new VisitResource($visit->load(self::RELATIONS)), 'Visita actualizada correctamente');
    }

    public function destroy(Visit $visit): JsonResponse
    {
        $this->visitService->delete($visit);

        return ApiResponse::success(null, 'Visita eliminada correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->visitService->forExport($request)->map(fn (Visit $visit) => [
            'property' => $visit->property->title,
            'client' => $visit->client->name,
            'scheduled_at' => $visit->scheduled_at->format('d/m/Y H:i'),
            'status' => $visit->status->value,
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'visitas', 'Visitas')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'visitas');
    }
}

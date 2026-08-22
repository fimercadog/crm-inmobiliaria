<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Activity\StoreActivityRequest;
use App\Http\Requests\Activity\UpdateActivityRequest;
use App\Http\Resources\ActivityResource;
use App\Http\Responses\ApiResponse;
use App\Models\Activity;
use App\Services\Activity\ActivityService;
use App\Services\Export\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActivityController extends Controller
{
    private const EXPORT_COLUMNS = [
        'type' => 'Tipo',
        'notes' => 'Notas',
        'occurred_at' => 'Fecha',
    ];

    public function __construct(
        private readonly ActivityService $activityService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->activityService->paginate($request);

        return ApiResponse::paginated(ActivityResource::collection($paginator));
    }

    public function store(StoreActivityRequest $request): JsonResponse
    {
        $activity = $this->activityService->create($request->validated());

        return ApiResponse::success(new ActivityResource($activity->load('agent')), 'Seguimiento registrado correctamente', Response::HTTP_CREATED);
    }

    public function show(Activity $activity): JsonResponse
    {
        return ApiResponse::success(new ActivityResource($activity->load('agent')));
    }

    public function update(UpdateActivityRequest $request, Activity $activity): JsonResponse
    {
        $this->activityService->update($activity, $request->validated());

        return ApiResponse::success(new ActivityResource($activity->load('agent')), 'Seguimiento actualizado correctamente');
    }

    public function destroy(Activity $activity): JsonResponse
    {
        $this->activityService->delete($activity);

        return ApiResponse::success(null, 'Seguimiento eliminado correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->activityService->forExport($request)->map(fn (Activity $activity) => [
            'type' => $activity->type->value,
            'notes' => $activity->notes,
            'occurred_at' => $activity->occurred_at->format('d/m/Y H:i'),
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'seguimientos', 'Seguimientos')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'seguimientos');
    }
}

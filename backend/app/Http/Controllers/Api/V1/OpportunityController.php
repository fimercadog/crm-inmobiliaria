<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Opportunity\StoreOpportunityRequest;
use App\Http\Requests\Opportunity\UpdateOpportunityRequest;
use App\Http\Resources\OpportunityResource;
use App\Http\Responses\ApiResponse;
use App\Models\Opportunity;
use App\Services\Export\ExportService;
use App\Services\Opportunity\OpportunityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OpportunityController extends Controller
{
    private const EXPORT_COLUMNS = [
        'client' => 'Cliente',
        'property' => 'Propiedad',
        'value' => 'Valor',
        'stage' => 'Etapa',
        'status' => 'Estado',
        'probability' => 'Probabilidad',
    ];

    private const RELATIONS = ['client', 'property', 'agent', 'owner'];

    public function __construct(
        private readonly OpportunityService $opportunityService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->opportunityService->paginate($request);

        return ApiResponse::paginated(OpportunityResource::collection($paginator));
    }

    public function store(StoreOpportunityRequest $request): JsonResponse
    {
        $this->authorize('create', Opportunity::class);

        $opportunity = $this->opportunityService->create($request->validated());

        return ApiResponse::success(
            new OpportunityResource($opportunity->load(self::RELATIONS)),
            'Oportunidad creada correctamente',
            Response::HTTP_CREATED,
        );
    }

    public function show(Opportunity $opportunity): JsonResponse
    {
        return ApiResponse::success(new OpportunityResource($opportunity->load(self::RELATIONS)));
    }

    public function update(UpdateOpportunityRequest $request, Opportunity $opportunity): JsonResponse
    {
        $this->authorize('update', $opportunity);

        $this->opportunityService->update($opportunity, $request->validated());

        return ApiResponse::success(new OpportunityResource($opportunity->load(self::RELATIONS)), 'Oportunidad actualizada correctamente');
    }

    public function destroy(Opportunity $opportunity): JsonResponse
    {
        $this->authorize('delete', $opportunity);

        $this->opportunityService->delete($opportunity);

        return ApiResponse::success(null, 'Oportunidad eliminada correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->opportunityService->forExport($request)->map(fn (Opportunity $opportunity) => [
            'client' => $opportunity->client->name,
            'property' => $opportunity->property->title ?? '—',
            'value' => $opportunity->value !== null ? number_format((float) $opportunity->value, 0, ',', '.') : '—',
            'stage' => $opportunity->stage->value,
            'status' => $opportunity->status->value,
            'probability' => $opportunity->probability !== null ? "{$opportunity->probability}%" : '—',
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'oportunidades', 'Oportunidades')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'oportunidades');
    }
}

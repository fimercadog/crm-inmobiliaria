<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Http\Requests\Lead\UpdateLeadRequest;
use App\Http\Resources\ClientResource;
use App\Http\Resources\LeadResource;
use App\Http\Responses\ApiResponse;
use App\Models\Lead;
use App\Services\Export\ExportService;
use App\Services\Lead\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LeadController extends Controller
{
    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'phone' => 'Teléfono',
        'email' => 'Correo',
        'source' => 'Origen',
        'status' => 'Estado',
    ];

    public function __construct(
        private readonly LeadService $leadService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->leadService->paginate($request);

        return ApiResponse::paginated(LeadResource::collection($paginator));
    }

    public function store(StoreLeadRequest $request): JsonResponse
    {
        $lead = $this->leadService->create($request->validated());

        return ApiResponse::success(new LeadResource($lead->load('agent')), 'Lead creado correctamente', Response::HTTP_CREATED);
    }

    public function show(Lead $lead): JsonResponse
    {
        return ApiResponse::success(new LeadResource($lead->load('agent')));
    }

    public function update(UpdateLeadRequest $request, Lead $lead): JsonResponse
    {
        $this->leadService->update($lead, $request->validated());

        return ApiResponse::success(new LeadResource($lead->load('agent')), 'Lead actualizado correctamente');
    }

    public function destroy(Lead $lead): JsonResponse
    {
        $this->leadService->delete($lead);

        return ApiResponse::success(null, 'Lead eliminado correctamente');
    }

    public function convert(Lead $lead): JsonResponse
    {
        if ($lead->status === LeadStatus::Convertido) {
            return ApiResponse::error('Este lead ya fue convertido', null, 422);
        }

        $client = $this->leadService->convertToClient($lead);

        return ApiResponse::success(new ClientResource($client), 'Lead convertido a cliente correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->leadService->forExport($request)->map(fn (Lead $lead) => [
            'name' => $lead->name,
            'phone' => $lead->phone ?? '—',
            'email' => $lead->email ?? '—',
            'source' => $lead->source->value,
            'status' => $lead->status->value,
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'leads', 'Leads')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'leads');
    }
}

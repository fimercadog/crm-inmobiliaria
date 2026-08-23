<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Export\ExportService;
use App\Services\Report\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    private const PROPERTIES_COLUMNS = [
        'status' => 'Estado',
        'count' => 'Cantidad',
        'total_value' => 'Valor total',
    ];

    private const CLOSINGS_COLUMNS = [
        'period' => 'Periodo',
        'won_count' => 'Ganados',
        'lost_count' => 'Perdidos',
        'won_value' => 'Valor ganado',
    ];

    private const AGENTS_COLUMNS = [
        'agent' => 'Agente',
        'properties_count' => 'Propiedades',
        'closed_count' => 'Cierres',
        'closed_value' => 'Valor cerrado',
        'pending_tasks_count' => 'Tareas pendientes',
    ];

    public function __construct(
        private readonly ReportService $reportService,
        private readonly ExportService $exportService,
    ) {}

    public function propertiesByStatus(Request $request)
    {
        $rows = $this->reportService->propertiesByStatus();

        return $this->respond($request, $rows, self::PROPERTIES_COLUMNS, 'propiedades-por-estado', 'Propiedades por estado');
    }

    public function closingsByPeriod(Request $request)
    {
        $months = (int) $request->integer('months', 6);
        $rows = $this->reportService->closingsByPeriod(max(1, min($months, 24)));

        return $this->respond($request, $rows, self::CLOSINGS_COLUMNS, 'cierres-por-periodo', 'Cierres por periodo');
    }

    public function agentPerformance(Request $request)
    {
        $rows = $this->reportService->agentPerformance();

        return $this->respond($request, $rows, self::AGENTS_COLUMNS, 'desempeno-por-agente', 'Desempeño por agente');
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @param  array<string, string>  $columns
     */
    private function respond(Request $request, Collection $rows, array $columns, string $filename, string $title): JsonResponse|Response
    {
        $format = $request->string('format')->lower()->value();

        if ($format === 'csv') {
            return $this->exportService->csv($rows, $columns, $filename);
        }

        if ($format === 'pdf') {
            return $this->exportService->pdf($rows, $columns, $filename, $title);
        }

        return ApiResponse::success($rows->values());
    }
}

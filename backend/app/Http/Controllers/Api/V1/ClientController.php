<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Http\Responses\ApiResponse;
use App\Models\Client;
use App\Services\Client\ClientService;
use App\Services\Export\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientController extends Controller
{
    private const EXPORT_COLUMNS = [
        'name' => 'Nombre',
        'phone' => 'Teléfono',
        'email' => 'Correo',
        'interest_type' => 'Interés',
        'budget_max' => 'Presupuesto máx.',
        'status' => 'Estado',
    ];

    public function __construct(
        private readonly ClientService $clientService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->clientService->paginate($request);

        return ApiResponse::paginated(ClientResource::collection($paginator));
    }

    public function options(): JsonResponse
    {
        return ApiResponse::success($this->clientService->forSelect());
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = $this->clientService->create($request->validated());

        return ApiResponse::success(new ClientResource($client->load('agent')), 'Cliente creado correctamente', Response::HTTP_CREATED);
    }

    public function show(Client $client): JsonResponse
    {
        return ApiResponse::success(new ClientResource($client->load('agent')));
    }

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $this->clientService->update($client, $request->validated());

        return ApiResponse::success(new ClientResource($client->load('agent')), 'Cliente actualizado correctamente');
    }

    public function destroy(Client $client): JsonResponse
    {
        $this->clientService->delete($client);

        return ApiResponse::success(null, 'Cliente eliminado correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->clientService->forExport($request)->map(fn (Client $client) => [
            'name' => $client->name,
            'phone' => $client->phone ?? '—',
            'email' => $client->email ?? '—',
            'interest_type' => $client->interest_type?->value ?? '—',
            'budget_max' => $client->budget_max !== null ? number_format((float) $client->budget_max, 0, ',', '.') : '—',
            'status' => $client->status->value,
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'clientes', 'Clientes')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'clientes');
    }
}

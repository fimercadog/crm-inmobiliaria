<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Http\Responses\ApiResponse;
use App\Models\Task;
use App\Services\Export\ExportService;
use App\Services\Task\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TaskController extends Controller
{
    private const EXPORT_COLUMNS = [
        'title' => 'Título',
        'due_date' => 'Fecha límite',
        'status' => 'Estado',
    ];

    public function __construct(
        private readonly TaskService $taskService,
        private readonly ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->taskService->paginate($request);

        return ApiResponse::paginated(TaskResource::collection($paginator));
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->create($request->validated());

        return ApiResponse::success(new TaskResource($task->load('agent')), 'Tarea creada correctamente', Response::HTTP_CREATED);
    }

    public function show(Task $task): JsonResponse
    {
        return ApiResponse::success(new TaskResource($task->load('agent')));
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->taskService->update($task, $request->validated());

        return ApiResponse::success(new TaskResource($task->load('agent')), 'Tarea actualizada correctamente');
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->taskService->delete($task);

        return ApiResponse::success(null, 'Tarea eliminada correctamente');
    }

    public function export(Request $request)
    {
        $format = $request->string('format', 'csv')->lower()->value();

        $rows = $this->taskService->forExport($request)->map(fn (Task $task) => [
            'title' => $task->title,
            'due_date' => $task->due_date?->format('d/m/Y') ?? '—',
            'status' => $task->status->value,
        ]);

        return $format === 'pdf'
            ? $this->exportService->pdf($rows, self::EXPORT_COLUMNS, 'tareas', 'Tareas')
            : $this->exportService->csv($rows, self::EXPORT_COLUMNS, 'tareas');
    }
}

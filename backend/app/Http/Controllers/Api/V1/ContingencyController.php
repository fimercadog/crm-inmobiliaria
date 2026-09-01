<?php

namespace App\Http\Controllers\Api\V1;

use App\Contingency\ContingencyModuleRegistry;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\ContingencyEvent;
use App\Models\ContingencySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ContingencyController extends Controller
{
    /** Current activation state — every authenticated user reads this to know
     * whether contingency is on and which modules are enabled. */
    public function status(): JsonResponse
    {
        $session = ContingencySession::query()->where('status', 'active')->latest('activated_at')->first();

        return ApiResponse::success([
            'active' => $session !== null,
            'session' => $session ? [
                'id' => $session->id,
                'enabled_modules' => $session->enabled_modules,
                'activated_at' => $session->activated_at->toIso8601String(),
                'activated_by' => $session->activatedBy->name,
            ] : null,
        ]);
    }

    public function modules(): JsonResponse
    {
        return ApiResponse::success(ContingencyModuleRegistry::eligible());
    }

    public function activate(Request $request): JsonResponse
    {
        Gate::authorize('manage-contingency');

        if (ContingencySession::query()->where('status', 'active')->exists()) {
            return ApiResponse::error('Ya existe una sesión de contingencia activa.', null, Response::HTTP_CONFLICT);
        }

        $validated = $request->validate([
            'enabled_modules' => ['required', 'array', 'min:1'],
            'enabled_modules.*' => ['string', Rule::in(ContingencyModuleRegistry::keys())],
        ]);

        $session = ContingencySession::create([
            'enabled_modules' => $validated['enabled_modules'],
            'activated_by' => $request->user()->id,
            'activated_at' => now(),
            'status' => 'active',
        ]);

        ContingencyEvent::create([
            'contingency_session_id' => $session->id,
            'type' => 'activated',
            'user_id' => $request->user()->id,
            'payload' => ['enabled_modules' => $validated['enabled_modules']],
            'created_at' => now(),
        ]);

        return ApiResponse::success($session, 'Modo contingencia activado', Response::HTTP_CREATED);
    }

    public function deactivate(Request $request): JsonResponse
    {
        Gate::authorize('manage-contingency');

        $session = ContingencySession::query()->where('status', 'active')->latest('activated_at')->first();

        if (! $session) {
            return ApiResponse::error('No hay ninguna sesión de contingencia activa.', null, Response::HTTP_CONFLICT);
        }

        // The pending-transactions gate lives on the client: the queue is
        // local (IndexedDB) to whichever device queued each transaction, so
        // the server has no way to know the true pending count. The frontend
        // refuses to call this endpoint while it has pending items; this
        // endpoint just records the closure once asked.
        $session->update([
            'status' => 'closed',
            'deactivated_by' => $request->user()->id,
            'deactivated_at' => now(),
        ]);

        ContingencyEvent::create([
            'contingency_session_id' => $session->id,
            'type' => 'deactivated',
            'user_id' => $request->user()->id,
            'payload' => null,
            'created_at' => now(),
        ]);

        return ApiResponse::success($session->fresh(), 'Modo contingencia desactivado');
    }
}

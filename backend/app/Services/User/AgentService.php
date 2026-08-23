<?php

namespace App\Services\User;

use App\Enums\OpportunityStatus;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class AgentService
{
    private const SORTABLE_COLUMNS = ['name', 'email', 'created_at'];

    public function paginate(Request $request): LengthAwarePaginator
    {
        $query = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Agente])
            ->withCount([
                'properties',
                'opportunities as open_opportunities_count' => fn (Builder $q) => $q->where('status', OpportunityStatus::Abierta),
                'tasks as pending_tasks_count' => fn (Builder $q) => $q->where('status', TaskStatus::Pendiente),
            ]);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sort = $request->string('sort')->value();
        $sortDir = $request->string('sort_dir', 'asc')->lower()->value() === 'desc' ? 'desc' : 'asc';

        if ($sort && in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy($sort, $sortDir);
        } else {
            $query->orderBy('name');
        }

        return $query->paginate(
            perPage: (int) $request->integer('per_page', 10),
            page: (int) $request->integer('page', 1),
        );
    }
}

<?php

namespace App\Services\Opportunity;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class OpportunityService
{
    private const SORTABLE_COLUMNS = ['value', 'stage', 'status', 'probability', 'estimated_close_date', 'created_at'];

    public function paginate(Request $request): LengthAwarePaginator
    {
        return $this->baseQuery($request)
            ->paginate(
                perPage: (int) $request->integer('per_page', 10),
                page: (int) $request->integer('page', 1),
            );
    }

    public function forExport(Request $request): Collection
    {
        return $this->baseQuery($request)->get();
    }

    public function paginateClosed(Request $request): LengthAwarePaginator
    {
        return $this->closedQuery($request)
            ->paginate(
                perPage: (int) $request->integer('per_page', 10),
                page: (int) $request->integer('page', 1),
            );
    }

    public function forClosedExport(Request $request): Collection
    {
        return $this->closedQuery($request)->get();
    }

    private function closedQuery(Request $request): Builder
    {
        $query = $this->baseQuery($request)->whereIn('status', [OpportunityStatus::Ganada, OpportunityStatus::Perdida]);

        $sort = $request->string('sort')->value();
        if (! $sort || ! in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->reorder()->orderByDesc('closed_at');
        }

        return $query;
    }

    private function baseQuery(Request $request): Builder
    {
        $query = Opportunity::query()->with(['client', 'property', 'agent', 'owner']);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->whereHas('client', fn (Builder $q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('property', fn (Builder $q) => $q->where('title', 'like', "%{$search}%"))
                    ->orWhere('next_action', 'like', "%{$search}%");
            });
        }

        foreach (['stage', 'status', 'agent_id', 'client_id', 'property_id'] as $filterKey) {
            if ($value = $request->input("filter.{$filterKey}")) {
                $query->where($filterKey, $value);
            }
        }

        $sort = $request->string('sort')->value();
        $sortDir = $request->string('sort_dir', 'asc')->lower()->value() === 'desc' ? 'desc' : 'asc';

        if ($sort && in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy($sort, $sortDir);
        } else {
            $query->orderByDesc('created_at');
        }

        return $query;
    }

    public function create(array $data): Opportunity
    {
        return Opportunity::create($data);
    }

    public function update(Opportunity $opportunity, array $data): Opportunity
    {
        $opportunity->update($data);

        return $opportunity;
    }

    public function delete(Opportunity $opportunity): void
    {
        $opportunity->delete();
    }
}

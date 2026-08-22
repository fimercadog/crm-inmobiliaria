<?php

namespace App\Services\Visit;

use App\Models\Visit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class VisitService
{
    private const SORTABLE_COLUMNS = ['scheduled_at', 'status', 'created_at'];

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

    private function baseQuery(Request $request): Builder
    {
        $query = Visit::query()->with(['property', 'client', 'agent']);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->whereHas('property', fn (Builder $q) => $q->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('client', fn (Builder $q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        foreach (['status', 'property_id', 'client_id', 'agent_id'] as $filterKey) {
            if ($value = $request->input("filter.{$filterKey}")) {
                $query->where($filterKey, $value);
            }
        }

        if ($from = $request->input('filter.scheduled_from')) {
            $query->where('scheduled_at', '>=', $from);
        }

        if ($to = $request->input('filter.scheduled_to')) {
            $query->where('scheduled_at', '<=', $to);
        }

        $sort = $request->string('sort')->value();
        $sortDir = $request->string('sort_dir', 'asc')->lower()->value() === 'desc' ? 'desc' : 'asc';

        if ($sort && in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy($sort, $sortDir);
        } else {
            $query->orderBy('scheduled_at');
        }

        return $query;
    }

    public function create(array $data): Visit
    {
        return Visit::create($data);
    }

    public function update(Visit $visit, array $data): Visit
    {
        $visit->update($data);

        return $visit;
    }

    public function delete(Visit $visit): void
    {
        $visit->delete();
    }
}

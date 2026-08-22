<?php

namespace App\Services\Activity;

use App\Models\Activity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ActivityService
{
    private const SORTABLE_COLUMNS = ['occurred_at', 'type', 'created_at'];

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
        $query = Activity::query()->with('agent');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('notes', 'like', "%{$search}%");
        }

        foreach (['type', 'agent_id', 'subject_type'] as $filterKey) {
            if ($value = $request->input("filter.{$filterKey}")) {
                $query->where($filterKey, $value);
            }
        }

        $sort = $request->string('sort')->value();
        $sortDir = $request->string('sort_dir', 'asc')->lower()->value() === 'desc' ? 'desc' : 'asc';

        if ($sort && in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy($sort, $sortDir);
        } else {
            $query->orderByDesc('occurred_at');
        }

        return $query;
    }

    public function create(array $data): Activity
    {
        return Activity::create($data);
    }

    public function update(Activity $activity, array $data): Activity
    {
        $activity->update($data);

        return $activity;
    }

    public function delete(Activity $activity): void
    {
        $activity->delete();
    }
}

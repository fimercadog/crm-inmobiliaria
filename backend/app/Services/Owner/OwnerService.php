<?php

namespace App\Services\Owner;

use App\Models\Owner;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class OwnerService
{
    private const SORTABLE_COLUMNS = ['name', 'status', 'created_at'];

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

    public function forSelect(): Collection
    {
        return Owner::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();
    }

    private function baseQuery(Request $request): Builder
    {
        $query = Owner::query()->withCount('properties');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('document', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }

        $sort = $request->string('sort')->value();
        $sortDir = $request->string('sort_dir', 'asc')->lower()->value() === 'desc' ? 'desc' : 'asc';

        if ($sort && in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy($sort, $sortDir);
        } else {
            $query->orderBy('name');
        }

        return $query;
    }

    public function create(array $data): Owner
    {
        return Owner::create($data);
    }

    public function update(Owner $owner, array $data): Owner
    {
        $owner->update($data);

        return $owner;
    }

    public function delete(Owner $owner): void
    {
        $owner->delete();
    }
}

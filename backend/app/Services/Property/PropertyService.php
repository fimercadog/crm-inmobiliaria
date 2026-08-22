<?php

namespace App\Services\Property;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class PropertyService
{
    private const SORTABLE_COLUMNS = ['title', 'price', 'city', 'status', 'created_at', 'published_at'];

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
        return Property::query()
            ->select(['id', 'code', 'title', 'owner_id'])
            ->orderBy('title')
            ->get();
    }

    private function baseQuery(Request $request): Builder
    {
        $query = Property::query()->with(['owner', 'agent']);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        foreach (['status', 'listing_type', 'property_type', 'city', 'agent_id', 'owner_id'] as $filterKey) {
            if ($value = $request->input("filter.{$filterKey}")) {
                $query->where($filterKey, $value);
            }
        }

        if ($min = $request->input('filter.price_min')) {
            $query->where('price', '>=', $min);
        }

        if ($max = $request->input('filter.price_max')) {
            $query->where('price', '<=', $max);
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

    public function create(array $data): Property
    {
        return Property::create($data);
    }

    public function update(Property $property, array $data): Property
    {
        $property->update($data);

        return $property;
    }

    public function delete(Property $property): void
    {
        $property->delete();
    }
}

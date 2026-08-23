<?php

namespace App\Services\Property;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class PublicPropertyService
{
    private const SORTABLE_COLUMNS = ['price', 'created_at'];

    private const FILTERABLE_COLUMNS = ['listing_type', 'property_type', 'city', 'zone', 'bedrooms', 'bathrooms'];

    public function paginate(Request $request): LengthAwarePaginator
    {
        return $this->baseQuery($request)
            ->paginate(
                perPage: max(1, min((int) $request->integer('per_page', 12), 24)),
                page: max(1, (int) $request->integer('page', 1)),
            );
    }

    /**
     * @return Collection<int, Property>
     */
    public function featured(int $limit = 6): Collection
    {
        return Property::query()
            ->published()
            ->where('is_featured', true)
            ->with('images')
            ->latest('published_at')
            ->take($limit)
            ->get();
    }

    private function baseQuery(Request $request): Builder
    {
        $query = Property::query()->published()->with('images');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('title', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('zone', 'like', "%{$search}%");
            });
        }

        foreach (self::FILTERABLE_COLUMNS as $filterKey) {
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
        $sortDir = $request->string('sort_dir', 'desc')->lower()->value() === 'asc' ? 'asc' : 'desc';

        if ($sort && in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy($sort, $sortDir);
        } else {
            $query->orderByDesc('published_at');
        }

        return $query;
    }
}

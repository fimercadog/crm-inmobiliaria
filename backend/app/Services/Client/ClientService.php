<?php

namespace App\Services\Client;

use App\Models\Client;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ClientService
{
    private const SORTABLE_COLUMNS = ['name', 'status', 'budget_max', 'created_at'];

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
        $query = Client::query()->with('agent');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('document', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        foreach (['status', 'interest_type', 'property_type_interest', 'agent_id'] as $filterKey) {
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

    public function create(array $data): Client
    {
        return Client::create($data);
    }

    public function update(Client $client, array $data): Client
    {
        $client->update($data);

        return $client;
    }

    public function delete(Client $client): void
    {
        $client->delete();
    }
}

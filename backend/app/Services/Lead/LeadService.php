<?php

namespace App\Services\Lead;

use App\Enums\ClientStatus;
use App\Enums\LeadStatus;
use App\Models\Client;
use App\Models\Lead;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LeadService
{
    private const SORTABLE_COLUMNS = ['name', 'source', 'status', 'created_at'];

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
        $query = Lead::query()->with('agent');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        foreach (['status', 'source', 'agent_id'] as $filterKey) {
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

    public function create(array $data): Lead
    {
        return Lead::create($data);
    }

    public function update(Lead $lead, array $data): Lead
    {
        $lead->update($data);

        return $lead;
    }

    public function delete(Lead $lead): void
    {
        $lead->delete();
    }

    public function convertToClient(Lead $lead): Client
    {
        return DB::transaction(function () use ($lead) {
            $client = Client::create([
                'name' => $lead->name,
                'phone' => $lead->phone,
                'email' => $lead->email,
                'agent_id' => $lead->agent_id,
                'notes' => $lead->notes,
                'status' => ClientStatus::Activo,
            ]);

            $lead->update([
                'status' => LeadStatus::Convertido,
                'converted_to_client_id' => $client->id,
            ]);

            return $client;
        });
    }
}

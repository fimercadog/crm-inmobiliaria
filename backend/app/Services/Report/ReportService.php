<?php

namespace App\Services\Report;

use App\Enums\OpportunityStatus;
use App\Enums\PropertyStatus;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Opportunity;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    /**
     * @return Collection<int, array{status: string, count: int, total_value: float}>
     */
    public function propertiesByStatus(): Collection
    {
        return Property::query()
            ->selectRaw('status, count(*) as count, coalesce(sum(price), 0) as total_value')
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status->value,
                'count' => (int) $row->count,
                'total_value' => (float) $row->total_value,
            ]);
    }

    /**
     * @return Collection<int, array{period: string, won_count: int, lost_count: int, won_value: float}>
     */
    public function closingsByPeriod(int $months = 6): Collection
    {
        $start = Carbon::today()->startOfMonth()->subMonths($months - 1);

        $closed = Opportunity::query()
            ->whereIn('status', [OpportunityStatus::Ganada, OpportunityStatus::Perdida])
            ->whereNotNull('closed_at')
            ->where('closed_at', '>=', $start)
            ->get(['status', 'value', 'closed_at']);

        return collect(range(0, $months - 1))
            ->map(fn (int $offset) => $start->copy()->addMonths($offset))
            ->map(function (Carbon $month) use ($closed) {
                $inMonth = $closed->filter(
                    fn ($opportunity) => $opportunity->closed_at->isSameMonth($month) && $opportunity->closed_at->isSameYear($month)
                );

                return [
                    'period' => $month->translatedFormat('F Y'),
                    'won_count' => $inMonth->where('status', OpportunityStatus::Ganada)->count(),
                    'lost_count' => $inMonth->where('status', OpportunityStatus::Perdida)->count(),
                    'won_value' => (float) $inMonth->where('status', OpportunityStatus::Ganada)->sum('value'),
                ];
            });
    }

    /**
     * One row per agent with a count per property status — feeds the
     * stacked bar chart on the dashboard. Agents with zero properties are
     * skipped rather than shown as an all-zero bar.
     *
     * @return Collection<int, array<string, string|int>>
     */
    public function propertiesByAgentStatus(): Collection
    {
        $rows = Property::query()
            ->whereNotNull('agent_id')
            ->selectRaw('agent_id, status, count(*) as count')
            ->groupBy('agent_id', 'status')
            ->get();

        $agentNames = User::query()->whereIn('id', $rows->pluck('agent_id')->unique())->pluck('name', 'id');

        return $rows
            ->groupBy('agent_id')
            ->map(function (Collection $group, $agentId) use ($agentNames) {
                $row = ['agent' => $agentNames[$agentId] ?? 'Sin asignar'];

                foreach (PropertyStatus::cases() as $status) {
                    $row[$status->value] = 0;
                }

                foreach ($group as $item) {
                    $row[$item->status->value] = (int) $item->count;
                }

                return $row;
            })
            ->values();
    }

    /**
     * @return Collection<int, array{agent: string, properties_count: int, closed_count: int, closed_value: float, pending_tasks_count: int}>
     */
    public function agentPerformance(): Collection
    {
        return User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::Agente])
            ->withCount([
                'properties',
                'opportunities as closed_count' => fn (Builder $q) => $q->whereIn('status', [OpportunityStatus::Ganada, OpportunityStatus::Perdida]),
                'tasks as pending_tasks_count' => fn (Builder $q) => $q->where('status', TaskStatus::Pendiente),
            ])
            ->withSum(['opportunities as closed_value' => fn (Builder $q) => $q->where('status', OpportunityStatus::Ganada)], 'value')
            ->orderBy('name')
            ->get()
            ->map(fn (User $agent) => [
                'agent' => $agent->name,
                'properties_count' => (int) $agent->properties_count,
                'closed_count' => (int) $agent->closed_count,
                'closed_value' => (float) ($agent->closed_value ?? 0),
                'pending_tasks_count' => (int) $agent->pending_tasks_count,
            ]);
    }
}

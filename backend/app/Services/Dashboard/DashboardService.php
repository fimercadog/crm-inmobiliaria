<?php

namespace App\Services\Dashboard;

use App\Enums\ClientStatus;
use App\Enums\LeadStatus;
use App\Enums\OpportunityStage;
use App\Enums\OpportunityStatus;
use App\Enums\PropertyStatus;
use App\Enums\TaskStatus;
use App\Models\Client;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Property;
use App\Models\Task;
use App\Models\Visit;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function summary(): array
    {
        $today = Carbon::today();

        return [
            'properties' => [
                'active' => Property::whereIn('status', [PropertyStatus::Disponible, PropertyStatus::Reservado])->count(),
                'available' => Property::where('status', PropertyStatus::Disponible)->count(),
                'reserved' => Property::where('status', PropertyStatus::Reservado)->count(),
                'sold' => Property::where('status', PropertyStatus::Vendido)->count(),
                'rented' => Property::where('status', PropertyStatus::Arrendado)->count(),
            ],
            'leads_new' => Lead::where('status', LeadStatus::Nuevo)->count(),
            'clients_active' => Client::where('status', ClientStatus::Activo)->count(),
            'visits_today' => Visit::whereBetween('scheduled_at', [$today, $today->copy()->addDay()])->count(),
            'visits_upcoming' => Visit::whereBetween('scheduled_at', [$today->copy()->addDay(), $today->copy()->addDays(8)])->count(),
            'opportunities_open' => Opportunity::where('status', OpportunityStatus::Abierta)->count(),
            'deals_in_negotiation' => Opportunity::where('stage', OpportunityStage::Negociacion)->count(),
            'closings_this_month' => Opportunity::where('stage', OpportunityStage::CierreGanado)
                ->whereNotNull('closed_at')
                ->whereMonth('closed_at', $today->month)
                ->whereYear('closed_at', $today->year)
                ->count(),
            'pipeline_value' => (float) Opportunity::where('status', OpportunityStatus::Abierta)->sum('value'),
            'tasks_pending' => Task::where('status', TaskStatus::Pendiente)->count(),
            'funnel' => [
                ['stage' => 'lead', 'label' => 'Lead', 'count' => Lead::whereIn('status', [LeadStatus::Nuevo, LeadStatus::Contactado, LeadStatus::Calificado])->count()],
                ['stage' => 'contactado', 'label' => 'Contactado', 'count' => Opportunity::whereIn('stage', [OpportunityStage::Contactado, OpportunityStage::Calificado])->count()],
                ['stage' => 'propiedad_recomendada', 'label' => 'Propiedad recomendada', 'count' => Opportunity::where('stage', OpportunityStage::PropiedadesEnviadas)->count()],
                ['stage' => 'visita', 'label' => 'Visita', 'count' => Opportunity::whereIn('stage', [OpportunityStage::VisitaAgendada, OpportunityStage::VisitaRealizada])->count()],
                ['stage' => 'negociacion', 'label' => 'Negociación', 'count' => Opportunity::where('stage', OpportunityStage::Negociacion)->count()],
                ['stage' => 'cierre', 'label' => 'Cierre', 'count' => Opportunity::whereIn('stage', [OpportunityStage::CierreGanado, OpportunityStage::CierrePerdido])->count()],
            ],
        ];
    }
}

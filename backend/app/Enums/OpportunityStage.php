<?php

namespace App\Enums;

enum OpportunityStage: string
{
    case Nuevo = 'nuevo';
    case Contactado = 'contactado';
    case Calificado = 'calificado';
    case PropiedadesEnviadas = 'propiedades_enviadas';
    case VisitaAgendada = 'visita_agendada';
    case VisitaRealizada = 'visita_realizada';
    case Negociacion = 'negociacion';
    case CierreGanado = 'cierre_ganado';
    case CierrePerdido = 'cierre_perdido';

    public function status(): OpportunityStatus
    {
        return match ($this) {
            self::CierreGanado => OpportunityStatus::Ganada,
            self::CierrePerdido => OpportunityStatus::Perdida,
            default => OpportunityStatus::Abierta,
        };
    }
}

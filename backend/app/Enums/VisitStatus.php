<?php

namespace App\Enums;

enum VisitStatus: string
{
    case Pendiente = 'pendiente';
    case Confirmada = 'confirmada';
    case Realizada = 'realizada';
    case Cancelada = 'cancelada';
    case Reprogramada = 'reprogramada';
    case NoAsistio = 'no_asistio';
}

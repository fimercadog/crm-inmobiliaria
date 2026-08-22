<?php

namespace App\Enums;

enum OpportunityStatus: string
{
    case Abierta = 'abierta';
    case Ganada = 'ganada';
    case Perdida = 'perdida';
}

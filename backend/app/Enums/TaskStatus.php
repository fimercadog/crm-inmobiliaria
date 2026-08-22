<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Pendiente = 'pendiente';
    case EnProgreso = 'en_progreso';
    case Completada = 'completada';
    case Cancelada = 'cancelada';
}

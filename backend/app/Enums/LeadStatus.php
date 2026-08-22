<?php

namespace App\Enums;

enum LeadStatus: string
{
    case Nuevo = 'nuevo';
    case Contactado = 'contactado';
    case Calificado = 'calificado';
    case Descartado = 'descartado';
    case Convertido = 'convertido';
}

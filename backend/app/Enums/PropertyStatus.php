<?php

namespace App\Enums;

enum PropertyStatus: string
{
    case Borrador = 'borrador';
    case Disponible = 'disponible';
    case Reservado = 'reservado';
    case Vendido = 'vendido';
    case Arrendado = 'arrendado';
    case Inactivo = 'inactivo';
}

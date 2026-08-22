<?php

namespace App\Enums;

enum PropertyType: string
{
    case Apartamento = 'apartamento';
    case Casa = 'casa';
    case Oficina = 'oficina';
    case Local = 'local';
    case Lote = 'lote';
    case Bodega = 'bodega';
    case Finca = 'finca';
    case Otro = 'otro';
}

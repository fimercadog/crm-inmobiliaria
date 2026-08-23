<?php

namespace App\Enums;

enum BlogPostStatus: string
{
    case Borrador = 'borrador';
    case Publicado = 'publicado';
}

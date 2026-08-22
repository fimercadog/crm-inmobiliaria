<?php

namespace App\Enums;

enum ActivityType: string
{
    case Llamada = 'llamada';
    case Whatsapp = 'whatsapp';
    case Correo = 'correo';
    case Reunion = 'reunion';
    case Nota = 'nota';
    case Seguimiento = 'seguimiento';
}

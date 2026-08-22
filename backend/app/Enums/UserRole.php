<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Agente = 'agente';
    case Asistente = 'asistente';
}

<?php

namespace App\Enums;

enum LeadSource: string
{
    case Web = 'web';
    case Whatsapp = 'whatsapp';
    case Llamada = 'llamada';
    case Referido = 'referido';
    case RedesSociales = 'redes_sociales';
    case PortalInmobiliario = 'portal_inmobiliario';
    case Manual = 'manual';
    case Otro = 'otro';
}

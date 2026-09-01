<?php

namespace App\Contingency;

/**
 * Single source of truth for which modules are technically eligible for
 * contingency mode. This is deliberately code, not database rows: eligibility
 * is an architectural decision (does this module's offline write path exist
 * and is it safe?), not something an admin should be able to toggle via a
 * settings screen. What the admin DOES choose per activation — which of
 * these eligible modules are actually enabled right now — is runtime data,
 * stored on ContingencySession::enabled_modules.
 *
 * To add a module later: implement its offline adapter on the frontend
 * (see frontend/src/features/contingency/module-registry.ts) and add one
 * entry here. Nothing else in the contingency engine needs to change.
 */
class ContingencyModuleRegistry
{
    /**
     * @return array<int, array{key: string, label: string, description: string}>
     */
    public static function eligible(): array
    {
        return [
            [
                'key' => 'activities',
                'label' => 'Seguimientos',
                'description' => 'Registrar notas de seguimiento (llamadas, correos, visitas comerciales). '
                    .'Es puramente aditivo: nunca modifica un registro existente ni depende de que otro dato '
                    .'cambie de estado, por lo que no puede generar conflictos de negocio.',
            ],
        ];
    }

    public static function isEligible(string $moduleKey): bool
    {
        return in_array($moduleKey, self::keys(), true);
    }

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_column(self::eligible(), 'key');
    }
}

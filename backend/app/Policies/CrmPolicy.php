<?php

namespace App\Policies;

use App\Models\User;

/**
 * Shared authorization rules for every core CRM resource (Property, Owner,
 * Client, Lead, Opportunity, Visit, Activity, Task). All eight modules follow
 * the same three-tier scheme, so one policy is registered for all of them
 * instead of eight near-identical classes:
 *
 * - Administrador: full access, including delete.
 * - Agente: can view, create, and edit; cannot delete.
 * - Asistente: read-only.
 */
class CrmPolicy
{
    /**
     * Read access is intentionally ungated here (every role can view) and
     * relies solely on the auth:api middleware; these two methods exist for
     * completeness but are not wired into the controllers.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->canWrite();
    }

    public function update(User $user): bool
    {
        return $user->canWrite();
    }

    public function delete(User $user): bool
    {
        return $user->isAdmin();
    }
}

<?php

namespace App\Services\Lead;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;

class PublicLeadService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Lead
    {
        return Lead::create([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'property_id' => $data['property_id'] ?? null,
            'notes' => $data['message'] ?? null,
            'source' => LeadSource::Web,
            'status' => LeadStatus::Nuevo,
            'metadata' => [
                ...($data['metadata'] ?? []),
                'intent' => $data['intent'],
            ],
        ]);
    }
}

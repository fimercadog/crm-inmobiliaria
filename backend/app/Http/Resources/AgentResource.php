<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'properties_count' => $this->properties_count,
            'open_opportunities_count' => $this->open_opportunities_count,
            'pending_tasks_count' => $this->pending_tasks_count,
        ];
    }
}

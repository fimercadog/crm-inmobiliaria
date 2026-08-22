<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property' => $this->whenLoaded('property', fn () => [
                'id' => $this->property->id,
                'code' => $this->property->code,
                'title' => $this->property->title,
            ]),
            'property_id' => $this->property_id,
            'client' => $this->whenLoaded('client', fn () => [
                'id' => $this->client->id,
                'name' => $this->client->name,
            ]),
            'client_id' => $this->client_id,
            'agent' => $this->whenLoaded('agent', fn () => $this->agent ? [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
            ] : null),
            'agent_id' => $this->agent_id,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'status' => $this->status->value,
            'notes' => $this->notes,
            'result' => $this->result,
            'follow_up' => $this->follow_up,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

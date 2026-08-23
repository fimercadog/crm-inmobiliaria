<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'property_type' => $this->property_type->value,
            'listing_type' => $this->listing_type->value,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
            ]),
            'agent' => $this->whenLoaded('agent', fn () => [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
            ]),
            'owner_id' => $this->owner_id,
            'agent_id' => $this->agent_id,
            'city' => $this->city,
            'zone' => $this->zone,
            'address' => $this->address,
            'price' => (float) $this->price,
            'admin_fee' => $this->admin_fee !== null ? (float) $this->admin_fee : null,
            'stratum' => $this->stratum,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'parking_spots' => $this->parking_spots,
            'built_area' => $this->built_area !== null ? (float) $this->built_area : null,
            'private_area' => $this->private_area !== null ? (float) $this->private_area : null,
            'year_built' => $this->year_built,
            'features' => $this->features ?? [],
            'notes' => $this->notes,
            'published_at' => $this->published_at?->toDateString(),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url(),
                'alt' => $image->alt,
                'sort_order' => $image->sort_order,
                'is_cover' => $image->is_cover,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

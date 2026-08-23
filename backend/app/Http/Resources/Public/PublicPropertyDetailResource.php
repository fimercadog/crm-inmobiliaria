<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-facing property detail page. Same privacy boundary as
 * PublicPropertyResource: no owner, no notes, no exact street address, no
 * private agent contact info — plus the description, full feature list and
 * gallery a detail page needs.
 */
class PublicPropertyDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'property_type' => $this->property_type->value,
            'listing_type' => $this->listing_type->value,
            'is_featured' => $this->is_featured,
            'city' => $this->city,
            'zone' => $this->zone,
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
            'agent' => $this->whenLoaded('agent', fn () => $this->agent ? ['name' => $this->agent->name] : null),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url(),
                'alt' => $image->alt,
                'is_cover' => $image->is_cover,
            ])),
            'published_at' => $this->published_at?->toDateString(),
        ];
    }
}

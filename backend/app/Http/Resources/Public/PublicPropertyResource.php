<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-facing property summary for listing/grid views. Deliberately omits
 * anything internal or private: no owner, no notes, no exact street address,
 * no agent contact details — only what's safe to publish on the website.
 */
class PublicPropertyResource extends JsonResource
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
            'property_type' => $this->property_type->value,
            'listing_type' => $this->listing_type->value,
            'is_featured' => $this->is_featured,
            'city' => $this->city,
            'zone' => $this->zone,
            'price' => (float) $this->price,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'parking_spots' => $this->parking_spots,
            'built_area' => $this->built_area !== null ? (float) $this->built_area : null,
            'private_area' => $this->private_area !== null ? (float) $this->private_area : null,
            'cover_image' => $this->whenLoaded(
                'images',
                fn () => ($this->images->firstWhere('is_cover', true) ?? $this->images->first())?->url()
            ),
        ];
    }
}

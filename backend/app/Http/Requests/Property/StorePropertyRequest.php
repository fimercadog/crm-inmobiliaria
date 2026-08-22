<?php

namespace App\Http\Requests\Property;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'property_type' => ['required', Rule::enum(PropertyType::class)],
            'listing_type' => ['required', Rule::enum(ListingType::class)],
            'status' => ['required', Rule::enum(PropertyStatus::class)],
            'owner_id' => ['nullable', 'exists:owners,id'],
            'agent_id' => ['nullable', 'exists:users,id'],
            'city' => ['required', 'string', 'max:255'],
            'zone' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'admin_fee' => ['nullable', 'numeric', 'min:0'],
            'stratum' => ['nullable', 'integer', 'between:1,6'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'parking_spots' => ['nullable', 'integer', 'min:0'],
            'built_area' => ['nullable', 'numeric', 'min:0'],
            'private_area' => ['nullable', 'numeric', 'min:0'],
            'year_built' => ['nullable', 'integer', 'min:1900', 'max:'.(date('Y') + 1)],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}

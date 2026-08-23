<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PropertyImage>
 */
class PropertyImageFactory extends Factory
{
    protected $model = PropertyImage::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'path' => 'property-images/'.fake()->uuid().'.jpg',
            'alt' => null,
            'sort_order' => 0,
            'is_cover' => false,
        ];
    }
}

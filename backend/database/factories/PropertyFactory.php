<?php

namespace Database\Factories;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use App\Models\Owner;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    private const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'];

    public function definition(): array
    {
        $propertyType = fake()->randomElement(PropertyType::cases());

        return [
            'title' => ucfirst($propertyType->value).' en '.fake()->streetName(),
            'description' => fake()->paragraph(),
            'property_type' => $propertyType,
            'listing_type' => fake()->randomElement(ListingType::cases()),
            'status' => fake()->randomElement(PropertyStatus::cases()),
            'owner_id' => Owner::factory(),
            'agent_id' => User::factory(),
            'city' => fake()->randomElement(self::CITIES),
            'zone' => fake()->citySuffix(),
            'address' => fake()->streetAddress(),
            'price' => fake()->numberBetween(80_000_000, 1_200_000_000),
            'admin_fee' => fake()->optional()->numberBetween(150_000, 900_000),
            'stratum' => fake()->numberBetween(1, 6),
            'bedrooms' => fake()->numberBetween(1, 5),
            'bathrooms' => fake()->numberBetween(1, 4),
            'parking_spots' => fake()->numberBetween(0, 3),
            'built_area' => fake()->numberBetween(40, 400),
            'private_area' => fake()->numberBetween(35, 380),
            'year_built' => fake()->numberBetween(1980, 2025),
            'features' => fake()->randomElements(
                ['piscina', 'gimnasio', 'salón social', 'terraza', 'balcón', 'seguridad 24h', 'ascensor'],
                fake()->numberBetween(0, 4),
            ),
            'notes' => null,
            'published_at' => fake()->optional()->date(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Enums\ClientStatus;
use App\Enums\InterestType;
use App\Enums\PropertyType;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    private const ZONES = ['Chapinero', 'Usaquén', 'Poblado', 'Laureles', 'Norte'];

    public function definition(): array
    {
        $min = fake()->numberBetween(100_000_000, 400_000_000);

        return [
            'name' => fake()->name(),
            'document' => fake()->numerify('##########'),
            'phone' => fake()->phoneNumber(),
            'whatsapp' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'interest_type' => fake()->randomElement(InterestType::cases()),
            'budget_min' => $min,
            'budget_max' => $min + fake()->numberBetween(50_000_000, 300_000_000),
            'interest_zones' => fake()->randomElements(self::ZONES, fake()->numberBetween(1, 3)),
            'property_type_interest' => fake()->randomElement(PropertyType::cases()),
            'bedrooms_needed' => fake()->numberBetween(1, 4),
            'notes' => null,
            'agent_id' => null,
            'status' => ClientStatus::Activo,
        ];
    }
}

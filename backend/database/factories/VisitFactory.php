<?php

namespace Database\Factories;

use App\Enums\VisitStatus;
use App\Models\Client;
use App\Models\Property;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Visit>
 */
class VisitFactory extends Factory
{
    protected $model = Visit::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'client_id' => Client::factory(),
            'agent_id' => null,
            'scheduled_at' => fake()->dateTimeBetween('-2 weeks', '+3 weeks'),
            'status' => fake()->randomElement(VisitStatus::cases()),
            'notes' => null,
            'result' => null,
            'follow_up' => null,
        ];
    }
}

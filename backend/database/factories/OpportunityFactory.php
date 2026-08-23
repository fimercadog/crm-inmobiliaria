<?php

namespace Database\Factories;

use App\Enums\OpportunityStage;
use App\Models\Client;
use App\Models\Opportunity;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Opportunity>
 */
class OpportunityFactory extends Factory
{
    protected $model = Opportunity::class;

    public function definition(): array
    {
        $stage = fake()->randomElement(OpportunityStage::cases());

        return [
            'client_id' => Client::factory(),
            'property_id' => fake()->boolean(70) ? Property::factory() : null,
            'agent_id' => fake()->boolean(80) ? User::factory() : null,
            'owner_id' => null,
            'value' => fake()->numberBetween(80_000_000, 900_000_000),
            'stage' => $stage,
            'status' => $stage->status(),
            'probability' => fake()->numberBetween(10, 90),
            'next_action' => fake()->optional()->sentence(6),
            'estimated_close_date' => fake()->optional()->dateTimeBetween('now', '+3 months')?->format('Y-m-d'),
            'notes' => null,
        ];
    }
}

<?php

namespace Database\Factories;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'source' => fake()->randomElement(LeadSource::cases()),
            'status' => fake()->randomElement(LeadStatus::cases()),
            'agent_id' => null,
            'converted_to_client_id' => null,
            'notes' => null,
        ];
    }
}

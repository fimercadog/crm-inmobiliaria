<?php

namespace Database\Factories;

use App\Enums\ActivityType;
use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(ActivityType::cases()),
            'notes' => fake()->sentence(10),
            'occurred_at' => fake()->dateTimeBetween('-1 month', 'now'),
            'agent_id' => null,
            'subject_type' => null,
            'subject_id' => null,
        ];
    }
}

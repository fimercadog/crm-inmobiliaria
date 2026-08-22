<?php

namespace Database\Factories;

use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'due_date' => fake()->optional(0.8)->dateTimeBetween('-1 week', '+3 weeks')?->format('Y-m-d'),
            'status' => fake()->randomElement(TaskStatus::cases()),
            'agent_id' => null,
            'subject_type' => null,
            'subject_id' => null,
        ];
    }
}

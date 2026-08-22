<?php

namespace Database\Factories;

use App\Enums\OwnerStatus;
use App\Models\Owner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Owner>
 */
class OwnerFactory extends Factory
{
    protected $model = Owner::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'document' => fake()->numerify('##########'),
            'phone' => fake()->phoneNumber(),
            'whatsapp' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'address' => fake()->address(),
            'notes' => null,
            'status' => OwnerStatus::Activo,
        ];
    }
}

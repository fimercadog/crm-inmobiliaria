<?php

namespace Database\Seeders;

use App\Models\Owner;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin CRM',
            'email' => 'admin@crm.test',
            'password' => 'password',
        ]);

        $agents = User::factory(3)->create();

        $owners = Owner::factory(15)->create();

        Property::factory(40)
            ->recycle($owners)
            ->recycle($agents->push($admin))
            ->create();
    }
}

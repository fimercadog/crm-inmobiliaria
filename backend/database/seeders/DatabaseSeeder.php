<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Lead;
use App\Models\Opportunity;
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

        $properties = Property::factory(40)
            ->recycle($owners)
            ->recycle($agents->push($admin))
            ->create();

        $clients = Client::factory(20)->create();

        Lead::factory(25)->create();

        Opportunity::factory(30)
            ->recycle($clients)
            ->recycle($properties)
            ->create();
    }
}

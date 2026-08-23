<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Activity;
use App\Models\BlogPost;
use App\Models\Client;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Owner;
use App\Models\Property;
use App\Models\Task;
use App\Models\User;
use App\Models\Visit;
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
            'role' => UserRole::Admin,
        ]);

        $agentUser = User::factory()->create([
            'name' => 'Agente de Prueba',
            'email' => 'agente@crm.test',
            'password' => 'password',
            'role' => UserRole::Agente,
        ]);

        User::factory()->create([
            'name' => 'Asistente de Prueba',
            'email' => 'asistente@crm.test',
            'password' => 'password',
            'role' => UserRole::Asistente,
        ]);

        $agents = User::factory(3)->create(['role' => UserRole::Agente])->push($agentUser);

        $owners = Owner::factory(15)->create();

        $properties = Property::factory(40)
            ->recycle($owners)
            ->recycle($agents->push($admin))
            ->create();

        // PropertyFactory sets published_at randomly (informational, pre-dates
        // its use as a visibility gate); reset it here so exactly two-thirds
        // are published to the public site, with the rest held back.
        $properties->each(fn (Property $property) => $property->forceFill(['published_at' => null])->save());
        $properties->random((int) ($properties->count() * 0.65))->each(
            fn (Property $property) => $property->forceFill(['published_at' => now()->subDays(random_int(0, 60))])->save()
        );
        $properties->where('published_at', '!=', null)->random(6)->each(
            fn (Property $property) => $property->update(['is_featured' => true])
        );

        $clients = Client::factory(20)->create();

        Lead::factory(25)->create();

        Opportunity::factory(30)
            ->recycle($clients)
            ->recycle($properties)
            ->recycle($agents)
            ->create();

        Visit::factory(25)
            ->recycle($clients)
            ->recycle($properties)
            ->recycle($agents)
            ->create();

        Activity::factory(30)->create();

        Task::factory(20)
            ->recycle($agents)
            ->create();

        BlogPost::factory(8)
            ->recycle($agents)
            ->create();
    }
}

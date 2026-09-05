<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Activity;
use App\Models\BlogPost;
use App\Models\Client;
use App\Models\Document;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Owner;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\Task;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        // PropertyImage module was never seeded either (same class of bug as
        // Documents below): every property showed an empty gallery with no
        // cover photo. Attach 3-6 real JPEG files per property — a decoded
        // placeholder, not a fake path string — so Storage::url() resolves
        // and the <img> gallery actually renders instead of 404ing.
        $placeholderImage = base64_decode(
            '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q=='
        );

        $properties->each(function (Property $property) use ($placeholderImage): void {
            $imageCount = random_int(3, 6);

            for ($i = 0; $i < $imageCount; $i++) {
                $path = 'property-images/'.Str::uuid().'.jpg';
                Storage::disk('public')->put($path, $placeholderImage);

                PropertyImage::factory()->create([
                    'property_id' => $property->id,
                    'path' => $path,
                    'sort_order' => $i,
                    'is_cover' => $i === 0,
                ]);
            }
        });

        // Documents module was never seeded (factory existed, nobody called
        // it), so every property/client/owner showed an empty "Documentos"
        // tab. Attach a handful of real, downloadable placeholder files —
        // not just fake path strings — so the download endpoint works too.
        $uploaders = $agents->push($admin);

        collect()
            ->concat($properties->random(10))
            ->concat($clients->random(6))
            ->concat($owners->random(4))
            ->each(function (Property|Client|Owner $subject) use ($uploaders): void {
                $path = 'documents/'.Str::uuid().'.pdf';
                Storage::disk('local')->put($path, "%PDF-1.4\n% Documento de muestra generado por el seeder de demo.\n");

                Document::factory()->create([
                    'path' => $path,
                    'subject_type' => Relation::getMorphAlias($subject::class),
                    'subject_id' => $subject->id,
                    'uploaded_by' => $uploaders->random()->id,
                ]);
            });
    }
}

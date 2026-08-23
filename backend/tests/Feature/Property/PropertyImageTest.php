<?php

namespace Tests\Feature\Property;

use App\Enums\UserRole;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyImageTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateAs(UserRole $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));

        return $user;
    }

    public function test_agente_can_upload_an_image(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Agente);
        $property = Property::factory()->create();

        $response = $this->post("/api/v1/properties/{$property->id}/images", [
            'file' => UploadedFile::fake()->image('foto.jpg'),
        ]);

        $response->assertCreated()->assertJsonPath('data.is_cover', true);
        $this->assertDatabaseCount('property_images', 1);
    }

    public function test_first_uploaded_image_becomes_the_cover_automatically(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();

        $this->post("/api/v1/properties/{$property->id}/images", ['file' => UploadedFile::fake()->image('a.jpg')])
            ->assertJsonPath('data.is_cover', true);

        $this->post("/api/v1/properties/{$property->id}/images", ['file' => UploadedFile::fake()->image('b.jpg')])
            ->assertJsonPath('data.is_cover', false);
    }

    public function test_asistente_cannot_upload_an_image(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Asistente);
        $property = Property::factory()->create();

        $this->post("/api/v1/properties/{$property->id}/images", ['file' => UploadedFile::fake()->image('foto.jpg')])
            ->assertStatus(403);
    }

    public function test_upload_rejects_non_image_files(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();

        $this->post("/api/v1/properties/{$property->id}/images", ['file' => UploadedFile::fake()->create('doc.pdf', 100)])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_setting_a_new_cover_unsets_the_previous_one(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();
        $first = PropertyImage::factory()->create(['property_id' => $property->id, 'is_cover' => true]);
        $second = PropertyImage::factory()->create(['property_id' => $property->id, 'is_cover' => false]);

        $this->patchJson("/api/v1/properties/{$property->id}/images/{$second->id}", ['is_cover' => true])
            ->assertOk()
            ->assertJsonPath('data.is_cover', true);

        $this->assertFalse($first->fresh()->is_cover);
        $this->assertTrue($second->fresh()->is_cover);
    }

    public function test_agente_can_delete_an_image(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Agente);
        $property = Property::factory()->create();
        $path = UploadedFile::fake()->image('foto.jpg')->store('property-images', 'public');
        $image = PropertyImage::factory()->create(['property_id' => $property->id, 'path' => $path]);

        $this->deleteJson("/api/v1/properties/{$property->id}/images/{$image->id}")->assertOk();

        $this->assertDatabaseMissing('property_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_deleting_the_cover_promotes_the_next_image(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();
        $cover = PropertyImage::factory()->create(['property_id' => $property->id, 'sort_order' => 0, 'is_cover' => true]);
        $next = PropertyImage::factory()->create(['property_id' => $property->id, 'sort_order' => 1, 'is_cover' => false]);

        $this->deleteJson("/api/v1/properties/{$property->id}/images/{$cover->id}")->assertOk();

        $this->assertTrue($next->fresh()->is_cover);
    }

    public function test_an_image_belonging_to_a_different_property_returns_404(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $propertyA = Property::factory()->create();
        $propertyB = Property::factory()->create();
        $image = PropertyImage::factory()->create(['property_id' => $propertyB->id]);

        $this->deleteJson("/api/v1/properties/{$propertyA->id}/images/{$image->id}")->assertStatus(404);
    }
}

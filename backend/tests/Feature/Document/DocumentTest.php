<?php

namespace Tests\Feature\Document;

use App\Enums\UserRole;
use App\Models\Document;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateAs(UserRole $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));

        return $user;
    }

    public function test_guest_cannot_list_documents(): void
    {
        $this->getJson('/api/v1/documents?subject_type=property&subject_id=1')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_documents_for_a_subject(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();

        Document::factory()->create(['subject_type' => 'property', 'subject_id' => $property->id]);
        Document::factory()->create(['subject_type' => 'property', 'subject_id' => $property->id]);
        Document::factory()->create(['subject_type' => 'client', 'subject_id' => 999]);

        $response = $this->getJson("/api/v1/documents?subject_type=property&subject_id={$property->id}");

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_agente_can_upload_a_document(): void
    {
        Storage::fake('local');
        $this->authenticateAs(UserRole::Agente);
        $property = Property::factory()->create();

        $file = UploadedFile::fake()->create('escritura.pdf', 100, 'application/pdf');

        $response = $this->post('/api/v1/documents', [
            'file' => $file,
            'subject_type' => 'property',
            'subject_id' => $property->id,
        ]);

        $response->assertCreated()->assertJsonPath('data.name', 'escritura.pdf');

        $document = Document::first();
        $this->assertNotNull($document);
        Storage::disk('local')->assertExists($document->path);
    }

    public function test_asistente_cannot_upload_a_document(): void
    {
        Storage::fake('local');
        $this->authenticateAs(UserRole::Asistente);
        $property = Property::factory()->create();

        $response = $this->post('/api/v1/documents', [
            'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            'subject_type' => 'property',
            'subject_id' => $property->id,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseCount('documents', 0);
    }

    public function test_upload_rejects_a_disallowed_file_type(): void
    {
        Storage::fake('local');
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();

        $response = $this->post('/api/v1/documents', [
            'file' => UploadedFile::fake()->create('script.exe', 10, 'application/x-msdownload'),
            'subject_type' => 'property',
            'subject_id' => $property->id,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['file']);
    }

    public function test_upload_rejects_a_subject_that_does_not_exist(): void
    {
        Storage::fake('local');
        $this->authenticateAs(UserRole::Admin);

        $response = $this->post('/api/v1/documents', [
            'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            'subject_type' => 'property',
            'subject_id' => 999_999,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['subject_id']);
    }

    public function test_admin_can_delete_a_document_and_its_file(): void
    {
        Storage::fake('local');
        $this->authenticateAs(UserRole::Admin);
        $property = Property::factory()->create();
        $path = UploadedFile::fake()->create('doc.pdf', 10)->store('documents', 'local');
        $document = Document::factory()->create(['subject_type' => 'property', 'subject_id' => $property->id, 'path' => $path]);

        $this->deleteJson("/api/v1/documents/{$document->id}")->assertOk();

        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
        Storage::disk('local')->assertMissing($path);
    }

    public function test_agente_cannot_delete_a_document(): void
    {
        $this->authenticateAs(UserRole::Agente);
        $document = Document::factory()->create(['subject_type' => 'property', 'subject_id' => 1]);

        $this->deleteJson("/api/v1/documents/{$document->id}")->assertStatus(403);
        $this->assertDatabaseHas('documents', ['id' => $document->id]);
    }

    public function test_asistente_can_download_a_document_since_read_access_is_intentionally_unrestricted(): void
    {
        Storage::fake('local');
        $this->authenticateAs(UserRole::Asistente);
        $path = UploadedFile::fake()->create('doc.pdf', 10)->store('documents', 'local');
        $document = Document::factory()->create(['subject_type' => 'property', 'subject_id' => 1, 'path' => $path, 'name' => 'doc.pdf']);

        $response = $this->get("/api/v1/documents/{$document->id}/download");

        $response->assertOk();
    }
}

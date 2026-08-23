<?php

namespace Tests\Feature\Blog;

use App\Enums\BlogPostStatus;
use App\Enums\UserRole;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BlogPostTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateAs(UserRole $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));

        return $user;
    }

    public function test_guest_cannot_list_posts(): void
    {
        $this->getJson('/api/v1/blog-posts')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_posts_paginated(): void
    {
        $this->authenticateAs(UserRole::Admin);
        BlogPost::factory(12)->create();

        $response = $this->getJson('/api/v1/blog-posts?per_page=10');

        $response->assertOk()->assertJsonCount(10, 'data.items')->assertJsonPath('data.meta.total', 12);
    }

    public function test_search_filters_by_title(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $target = BlogPost::factory()->create(['title' => 'Consejos únicos para vender rápido']);
        BlogPost::factory(4)->create();

        $response = $this->getJson('/api/v1/blog-posts?search=vender rápido');

        $response->assertOk()->assertJsonCount(1, 'data.items');
        $this->assertSame($target->id, $response->json('data.items.0.id'));
    }

    public function test_status_filter_narrows_results(): void
    {
        $this->authenticateAs(UserRole::Admin);
        BlogPost::factory(3)->create(['status' => BlogPostStatus::Publicado]);
        BlogPost::factory(2)->create(['status' => BlogPostStatus::Borrador]);

        $response = $this->getJson('/api/v1/blog-posts?filter[status]=borrador');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_agente_can_create_a_post_and_becomes_its_author(): void
    {
        $agent = $this->authenticateAs(UserRole::Agente);

        $payload = [
            'title' => 'Cinco tendencias del mercado inmobiliario',
            'content' => 'Contenido completo del artículo.',
            'status' => BlogPostStatus::Borrador->value,
        ];

        $response = $this->postJson('/api/v1/blog-posts', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', $payload['title'])
            ->assertJsonPath('data.author.id', $agent->id);

        $this->assertDatabaseHas('blog_posts', ['title' => $payload['title'], 'author_id' => $agent->id]);
        $this->assertNotNull($response->json('data.slug'));
    }

    public function test_asistente_cannot_create_a_post(): void
    {
        $this->authenticateAs(UserRole::Asistente);

        $this->postJson('/api/v1/blog-posts', [
            'title' => 'Intento no autorizado',
            'content' => 'Contenido',
            'status' => BlogPostStatus::Borrador->value,
        ])->assertStatus(403);
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->authenticateAs(UserRole::Admin);

        $this->postJson('/api/v1/blog-posts', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'content', 'status']);
    }

    public function test_author_id_cannot_be_spoofed_by_the_client(): void
    {
        $admin = $this->authenticateAs(UserRole::Admin);
        $otherUser = User::factory()->create();

        $response = $this->postJson('/api/v1/blog-posts', [
            'title' => 'Intento de spoof de autor',
            'content' => 'Contenido',
            'status' => BlogPostStatus::Borrador->value,
            'author_id' => $otherUser->id,
        ]);

        $response->assertCreated()->assertJsonPath('data.author.id', $admin->id);
    }

    public function test_authenticated_user_can_update_a_post(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $post = BlogPost::factory()->create(['status' => BlogPostStatus::Borrador]);

        $response = $this->putJson("/api/v1/blog-posts/{$post->id}", [
            'title' => $post->title,
            'content' => $post->content,
            'status' => BlogPostStatus::Publicado->value,
            'published_at' => now()->toDateString(),
        ]);

        $response->assertOk()->assertJsonPath('data.status', BlogPostStatus::Publicado->value);
    }

    public function test_updating_the_title_does_not_change_an_existing_slug(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $post = BlogPost::factory()->create(['title' => 'Título original']);
        $originalSlug = $post->slug;

        $this->putJson("/api/v1/blog-posts/{$post->id}", [
            'title' => 'Título completamente distinto',
            'content' => $post->content,
            'status' => $post->status->value,
        ])->assertOk();

        $this->assertSame($originalSlug, $post->fresh()->slug);
    }

    public function test_agente_cannot_delete_a_post(): void
    {
        $this->authenticateAs(UserRole::Agente);
        $post = BlogPost::factory()->create();

        $this->deleteJson("/api/v1/blog-posts/{$post->id}")->assertStatus(403);
    }

    public function test_admin_can_delete_a_post(): void
    {
        $this->authenticateAs(UserRole::Admin);
        $post = BlogPost::factory()->create();

        $this->deleteJson("/api/v1/blog-posts/{$post->id}")->assertOk();

        $this->assertDatabaseMissing('blog_posts', ['id' => $post->id]);
    }

    public function test_can_upload_a_cover_image(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Admin);
        $post = BlogPost::factory()->create();

        $response = $this->post("/api/v1/blog-posts/{$post->id}/cover-image", [
            'file' => UploadedFile::fake()->image('portada.jpg'),
        ]);

        $response->assertOk();
        $this->assertNotNull($post->fresh()->cover_image);
        Storage::disk('public')->assertExists($post->fresh()->cover_image);
    }

    public function test_uploading_a_new_cover_image_replaces_the_previous_file(): void
    {
        Storage::fake('public');
        $this->authenticateAs(UserRole::Admin);
        $post = BlogPost::factory()->create();

        $this->post("/api/v1/blog-posts/{$post->id}/cover-image", ['file' => UploadedFile::fake()->image('a.jpg')]);
        $firstPath = $post->fresh()->cover_image;

        $this->post("/api/v1/blog-posts/{$post->id}/cover-image", ['file' => UploadedFile::fake()->image('b.jpg')]);
        $secondPath = $post->fresh()->cover_image;

        $this->assertNotSame($firstPath, $secondPath);
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($secondPath);
    }

    public function test_can_export_posts_as_csv(): void
    {
        $this->authenticateAs(UserRole::Admin);
        BlogPost::factory(3)->create();

        $response = $this->get('/api/v1/blog-posts/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}

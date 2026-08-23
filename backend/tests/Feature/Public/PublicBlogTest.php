<?php

namespace Tests\Feature\Public;

use App\Enums\BlogPostStatus;
use App\Models\BlogPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBlogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_published_posts_without_auth(): void
    {
        BlogPost::factory(3)->create(['status' => BlogPostStatus::Publicado, 'published_at' => now()->subDay()]);
        BlogPost::factory(2)->create(['status' => BlogPostStatus::Borrador, 'published_at' => null]);

        $response = $this->getJson('/api/v1/public/blog');

        $response->assertOk()->assertJsonCount(3, 'data.items');
    }

    public function test_draft_posts_are_never_returned(): void
    {
        BlogPost::factory()->create(['status' => BlogPostStatus::Borrador, 'published_at' => null]);

        $this->getJson('/api/v1/public/blog')->assertOk()->assertJsonCount(0, 'data.items');
    }

    public function test_a_published_post_with_a_future_date_is_not_visible_yet(): void
    {
        BlogPost::factory()->create(['status' => BlogPostStatus::Publicado, 'published_at' => now()->addDay()]);

        $this->getJson('/api/v1/public/blog')->assertOk()->assertJsonCount(0, 'data.items');
    }

    public function test_guest_can_view_a_published_post_by_slug(): void
    {
        $post = BlogPost::factory()->create([
            'status' => BlogPostStatus::Publicado,
            'published_at' => now()->subDay(),
            'content' => 'Contenido completo del artículo',
        ]);

        $response = $this->getJson("/api/v1/public/blog/{$post->slug}");

        $response->assertOk()
            ->assertJsonPath('data.slug', $post->slug)
            ->assertJsonPath('data.content', 'Contenido completo del artículo');
    }

    public function test_draft_post_detail_returns_404(): void
    {
        $post = BlogPost::factory()->create(['status' => BlogPostStatus::Borrador, 'published_at' => null]);

        $this->getJson("/api/v1/public/blog/{$post->slug}")->assertStatus(404);
    }

    public function test_duplicate_titles_get_unique_slugs(): void
    {
        $first = BlogPost::factory()->create(['title' => 'Consejos para vender tu casa']);
        $second = BlogPost::factory()->create(['title' => 'Consejos para vender tu casa']);

        $this->assertNotSame($first->slug, $second->slug);
    }
}

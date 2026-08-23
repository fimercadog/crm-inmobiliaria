<?php

namespace Database\Factories;

use App\Enums\BlogPostStatus;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogPost>
 */
class BlogPostFactory extends Factory
{
    protected $model = BlogPost::class;

    public function definition(): array
    {
        $status = fake()->randomElement(BlogPostStatus::cases());

        return [
            'title' => fake()->sentence(6),
            'excerpt' => fake()->sentence(20),
            'content' => implode("\n\n", fake()->paragraphs(5)),
            'cover_image' => null,
            'author_id' => User::factory(),
            'status' => $status,
            'published_at' => $status === BlogPostStatus::Publicado ? fake()->dateTimeBetween('-6 months', 'now') : null,
            'meta_title' => null,
            'meta_description' => null,
        ];
    }
}

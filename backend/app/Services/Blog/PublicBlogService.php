<?php

namespace App\Services\Blog;

use App\Models\BlogPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class PublicBlogService
{
    public function paginate(Request $request): LengthAwarePaginator
    {
        return BlogPost::query()
            ->published()
            ->with('author')
            ->orderByDesc('published_at')
            ->paginate(
                perPage: max(1, min((int) $request->integer('per_page', 9), 24)),
                page: max(1, (int) $request->integer('page', 1)),
            );
    }
}

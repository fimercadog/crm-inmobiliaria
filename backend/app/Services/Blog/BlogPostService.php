<?php

namespace App\Services\Blog;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class BlogPostService
{
    private const SORTABLE_COLUMNS = ['title', 'status', 'published_at', 'created_at'];

    public function paginate(Request $request): LengthAwarePaginator
    {
        return $this->baseQuery($request)
            ->paginate(
                perPage: (int) $request->integer('per_page', 10),
                page: (int) $request->integer('page', 1),
            );
    }

    public function forExport(Request $request): Collection
    {
        return $this->baseQuery($request)->get();
    }

    private function baseQuery(Request $request): Builder
    {
        $query = BlogPost::query()->with('author');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }

        $sort = $request->string('sort')->value();
        $sortDir = $request->string('sort_dir', 'desc')->lower()->value() === 'asc' ? 'asc' : 'desc';

        if ($sort && in_array($sort, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy($sort, $sortDir);
        } else {
            $query->orderByDesc('created_at');
        }

        return $query;
    }

    public function create(array $data, User $author): BlogPost
    {
        return BlogPost::create([...$data, 'author_id' => $author->id]);
    }

    public function update(BlogPost $post, array $data): BlogPost
    {
        $post->update($data);

        return $post;
    }

    public function delete(BlogPost $post): void
    {
        $post->delete();
    }
}

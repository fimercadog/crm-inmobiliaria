<?php

namespace App\Http\Requests\Blog;

class UpdateBlogPostRequest extends StoreBlogPostRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

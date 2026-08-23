<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'image', 'max:5120', 'mimes:jpg,jpeg,png,webp'],
            'alt' => ['nullable', 'string', 'max:255'],
        ];
    }
}

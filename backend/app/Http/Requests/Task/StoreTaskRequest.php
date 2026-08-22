<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(TaskStatus::class)],
            'agent_id' => ['nullable', 'exists:users,id'],
            'subject_type' => ['nullable', Rule::in(['client', 'lead', 'opportunity', 'property'])],
            'subject_id' => ['nullable', 'required_with:subject_type', 'integer'],
        ];
    }
}

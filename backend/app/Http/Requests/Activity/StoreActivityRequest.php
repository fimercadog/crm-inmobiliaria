<?php

namespace App\Http\Requests\Activity;

use App\Enums\ActivityType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActivityRequest extends FormRequest
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
            'type' => ['required', Rule::enum(ActivityType::class)],
            'notes' => ['required', 'string'],
            'occurred_at' => ['required', 'date'],
            'agent_id' => ['nullable', 'exists:users,id'],
            'subject_type' => ['nullable', Rule::in(['client', 'lead', 'opportunity', 'property'])],
            'subject_id' => ['nullable', 'required_with:subject_type', 'integer'],
            // Set only when this activity is being synced from a contingency
            // (offline) queue — lets the sync be safely retried.
            'client_uuid' => ['nullable', 'uuid'],
        ];
    }
}

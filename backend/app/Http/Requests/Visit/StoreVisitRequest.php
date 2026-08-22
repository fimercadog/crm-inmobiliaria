<?php

namespace App\Http\Requests\Visit;

use App\Enums\VisitStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVisitRequest extends FormRequest
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
            'property_id' => ['required', 'exists:properties,id'],
            'client_id' => ['required', 'exists:clients,id'],
            'agent_id' => ['nullable', 'exists:users,id'],
            'scheduled_at' => ['required', 'date'],
            'status' => ['required', Rule::enum(VisitStatus::class)],
            'notes' => ['nullable', 'string'],
            'result' => ['nullable', 'string'],
            'follow_up' => ['nullable', 'string'],
        ];
    }
}

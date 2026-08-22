<?php

namespace App\Http\Requests\Lead;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'source' => ['required', Rule::enum(LeadSource::class)],
            'status' => ['required', Rule::enum(LeadStatus::class)],
            'agent_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

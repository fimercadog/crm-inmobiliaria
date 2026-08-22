<?php

namespace App\Http\Requests\Opportunity;

use App\Enums\OpportunityStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOpportunityRequest extends FormRequest
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
            'client_id' => ['required', 'exists:clients,id'],
            'property_id' => ['nullable', 'exists:properties,id'],
            'agent_id' => ['nullable', 'exists:users,id'],
            'owner_id' => ['nullable', 'exists:owners,id'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'stage' => ['required', Rule::enum(OpportunityStage::class)],
            'probability' => ['nullable', 'integer', 'between:0,100'],
            'next_action' => ['nullable', 'string', 'max:255'],
            'estimated_close_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

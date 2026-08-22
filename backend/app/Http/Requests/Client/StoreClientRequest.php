<?php

namespace App\Http\Requests\Client;

use App\Enums\ClientStatus;
use App\Enums\InterestType;
use App\Enums\PropertyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
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
            'document' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:50'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'interest_type' => ['nullable', Rule::enum(InterestType::class)],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0', 'gte:budget_min'],
            'interest_zones' => ['nullable', 'array'],
            'interest_zones.*' => ['string', 'max:100'],
            'property_type_interest' => ['nullable', Rule::enum(PropertyType::class)],
            'bedrooms_needed' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'agent_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', Rule::enum(ClientStatus::class)],
        ];
    }
}

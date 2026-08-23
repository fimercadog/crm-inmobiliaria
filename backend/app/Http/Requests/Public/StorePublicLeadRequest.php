<?php

namespace App\Http\Requests\Public;

use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePublicLeadRequest extends FormRequest
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
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'property_id' => ['nullable', 'integer', Rule::exists('properties', 'id')],
            'message' => ['nullable', 'string', 'max:2000'],
            'intent' => ['required', Rule::in(['compra_arriendo', 'vender_propiedad', 'contacto_general'])],
            // Only the fields the public forms actually send are accepted; the
            // `array:...` rule rejects any other key outright.
            'metadata' => ['nullable', 'array:property_type,listing_type,city,zone,address,estimated_price,subject'],
            'metadata.property_type' => ['nullable', 'string', 'max:100'],
            'metadata.listing_type' => ['nullable', 'string', 'max:100'],
            'metadata.city' => ['nullable', 'string', 'max:100'],
            'metadata.zone' => ['nullable', 'string', 'max:100'],
            'metadata.address' => ['nullable', 'string', 'max:255'],
            'metadata.estimated_price' => ['nullable', 'numeric', 'min:0'],
            'metadata.subject' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('email') && ! $this->filled('phone')) {
                $validator->errors()->add('email', 'Debes indicar al menos un correo o un teléfono de contacto.');
            }

            $propertyId = $this->input('property_id');
            if ($propertyId && ! Property::query()->published()->whereKey($propertyId)->exists()) {
                $validator->errors()->add('property_id', 'La propiedad indicada no está disponible.');
            }
        });
    }
}

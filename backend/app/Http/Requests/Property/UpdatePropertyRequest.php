<?php

namespace App\Http\Requests\Property;

class UpdatePropertyRequest extends StorePropertyRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

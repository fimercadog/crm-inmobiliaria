<?php

namespace App\Http\Requests\Owner;

class UpdateOwnerRequest extends StoreOwnerRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

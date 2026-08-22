<?php

namespace App\Http\Requests\Lead;

class UpdateLeadRequest extends StoreLeadRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

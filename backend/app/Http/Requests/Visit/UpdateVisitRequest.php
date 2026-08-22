<?php

namespace App\Http\Requests\Visit;

class UpdateVisitRequest extends StoreVisitRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

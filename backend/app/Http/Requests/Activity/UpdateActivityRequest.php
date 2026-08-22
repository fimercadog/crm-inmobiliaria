<?php

namespace App\Http\Requests\Activity;

class UpdateActivityRequest extends StoreActivityRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

<?php

namespace App\Http\Requests\Client;

class UpdateClientRequest extends StoreClientRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

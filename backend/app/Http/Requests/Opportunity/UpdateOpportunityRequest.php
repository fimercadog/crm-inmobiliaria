<?php

namespace App\Http\Requests\Opportunity;

class UpdateOpportunityRequest extends StoreOpportunityRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}

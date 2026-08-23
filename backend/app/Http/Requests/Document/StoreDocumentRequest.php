<?php

namespace App\Http\Requests\Document;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreDocumentRequest extends FormRequest
{
    private const SUBJECT_TYPES = ['client', 'lead', 'opportunity', 'property', 'owner'];

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
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx'],
            'subject_type' => ['required', 'string', Rule::in(self::SUBJECT_TYPES)],
            'subject_id' => ['required', 'integer'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $subjectType = $this->input('subject_type');
            $subjectId = $this->input('subject_id');

            if (! $subjectType || ! $subjectId) {
                return;
            }

            $modelClass = Relation::getMorphedModel($subjectType);

            if (! $modelClass || ! $modelClass::query()->whereKey($subjectId)->exists()) {
                $validator->errors()->add('subject_id', 'El registro relacionado no existe.');
            }
        });
    }
}

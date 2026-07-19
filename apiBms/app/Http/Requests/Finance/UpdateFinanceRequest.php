<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFinanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'strTitle' => 'sometimes|required|string|max:50',
            'cCategory' => 'sometimes|required|string|size:1',
            'cType' => 'nullable|string|size:1',
            'dAmount' => 'sometimes|required|numeric|min:0',
            'strNote' => 'nullable|string|max:100',
            'dtOccur' => 'sometimes|required|date',
        ];
    }
}
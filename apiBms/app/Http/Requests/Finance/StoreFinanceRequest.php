<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'strTitle' => 'required|string|max:50',
            'cCategory' => 'required|string|size:1',
            'cType' => 'nullable|string|size:1',
            'dAmount' => 'required|numeric|min:0',
            'strNote' => 'nullable|string|max:100',
            'dtOccur' => 'required|date',
        ];
    }
}
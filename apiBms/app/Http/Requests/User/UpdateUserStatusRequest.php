<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->cUserRole === 'A';
    }

    public function rules(): array
    {
        return [
            'cAccountStatus' => 'required|string|in:A,S',
        ];
    }
}
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public endpoint
    }

    public function rules(): array
    {
        return [
            'strFName' => 'required|string|max:50',
            'strMName' => 'nullable|string|max:50',
            'strLName' => 'required|string|max:50',
            'strEName' => 'nullable|string|max:50',
            'strPhoneNumber' => 'nullable|string|max:30',
            'strEmail' => 'required|string|email|max:255|unique:userstbl,strEmail',
            'strPassword' => 'required|string|min:6|max:20|confirmed',
        ];
    }
}
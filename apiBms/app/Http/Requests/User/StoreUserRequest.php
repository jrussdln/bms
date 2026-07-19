<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only admins can create users via this endpoint
        return $this->user()?->cUserRole === 'A';
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
            'cUserRole' => 'sometimes|string|in:U,A',
            'cAccountStatus' => 'sometimes|string|in:A,S',
        ];
    }
}
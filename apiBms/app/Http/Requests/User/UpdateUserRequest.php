<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();
        // Admins can edit anyone; a user can edit only their own record,
        // and only an admin may change cUserRole/cAccountStatus (checked below).
        return $actor && ($actor->cUserRole === 'A' || $actor->nUserId === $this->route('user')->nUserId);
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'strFName' => 'sometimes|required|string|max:50',
            'strMName' => 'sometimes|nullable|string|max:50',
            'strLName' => 'sometimes|required|string|max:50',
            'strEName' => 'sometimes|nullable|string|max:50',
            'strPhoneNumber' => 'sometimes|nullable|string|max:30',
            'strEmail' => 'sometimes|required|string|email|max:255|unique:userstbl,strEmail,' . $user->nUserId . ',nUserId',
            'strPassword' => 'sometimes|required|string|min:6|max:20|confirmed',
            'cUserRole' => ['sometimes', 'string', 'in:U,A', $this->user()->cUserRole === 'A' ? '' : 'prohibited'],
            'cAccountStatus' => ['sometimes', 'string', 'in:A,S', $this->user()->cUserRole === 'A' ? '' : 'prohibited'],
        ];
    }
}
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'nUserId' => $this->nUserId,
            'strFName' => $this->strFName,
            'strMName' => $this->strMName,
            'strLName' => $this->strLName,
            'strEName' => $this->strEName,
            'strName' => $this->strName, // computed accessor on the model
            'strPhoneNumber' => $this->strPhoneNumber,
            'strEmail' => $this->strEmail,
            'cUserRole' => $this->cUserRole,
            'cAccountStatus' => $this->cAccountStatus,
            'cCurrentStatus' => $this->cCurrentStatus,
            'strProfileImage' => $this->strProfileImage,
            'dtLoggedIn' => $this->dtLoggedIn,
            'dtCreated' => $this->dtCreated,
            'dtUpdated' => $this->dtUpdated,
            'dtLastSeen' => $this->dtLastSeen,
        ];
    }
}
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'nRecordsId' => $this->nRecordsId,
            'strTitle' => $this->strTitle,
            'cCategory' => $this->cCategory,
            'cType' => $this->cType,
            'dAmount' => $this->dAmount,
            'strNote' => $this->strNote,
            'dtOccur' => $this->dtOccur,
        ];
    }
}
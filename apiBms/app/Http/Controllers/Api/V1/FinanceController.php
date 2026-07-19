<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\FinanceUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreFinanceRequest;
use App\Http\Requests\Finance\UpdateFinanceRequest;
use App\Http\Resources\FinanceResource;
use App\Models\Finance;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $records = Finance::where('nUserId', $request->user()->nUserId)
            ->orderBy('dtOccur', 'desc')
            ->get();

        return FinanceResource::collection($records);
    }

    public function store(StoreFinanceRequest $request)
    {
        $record = Finance::create([
            'nUserId' => $request->user()->nUserId,
            'strTitle' => $request->strTitle,
            'cCategory' => $request->cCategory,
            'cType' => $request->cType,
            'dAmount' => $request->dAmount,
            'strNote' => $request->strNote,
            'dtOccur' => $request->dtOccur,
        ]);

        event(new FinanceUpdated('created', $request->user()->nUserId, $record->nRecordsId));

        return response()->json([
            'message' => 'Record saved successfully',
            'record' => new FinanceResource($record),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $record = Finance::where('nUserId', $request->user()->nUserId)
            ->where('nRecordsId', $id)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        return new FinanceResource($record);
    }

    public function update(UpdateFinanceRequest $request, $id)
    {
        $record = Finance::where('nUserId', $request->user()->nUserId)
            ->where('nRecordsId', $id)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $record->update($request->only([
            'strTitle', 'cCategory', 'cType', 'dAmount', 'strNote', 'dtOccur',
        ]));

        event(new FinanceUpdated('updated', $request->user()->nUserId, $record->nRecordsId));

        return response()->json([
            'message' => 'Record updated successfully',
            'record' => new FinanceResource($record),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $record = Finance::where('nUserId', $request->user()->nUserId)
            ->where('nRecordsId', $id)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $record->delete();

        event(new FinanceUpdated('deleted', $request->user()->nUserId, $record->nRecordsId));

        return response()->json(['message' => 'Record deleted successfully']);
    }
}
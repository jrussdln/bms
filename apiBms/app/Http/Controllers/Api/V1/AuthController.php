<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Events\UserUpdated;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'strFName' => $request->strFName,
            'strMName' => $request->strMName,
            'strLName' => $request->strLName,
            'strEName' => $request->strEName,
            'strPhoneNumber' => $request->strPhoneNumber,
            'strEmail' => $request->strEmail,
            'strPassword' => $request->strPassword,
            'cUserRole' => 'U',
            'cAccountStatus' => 'A',
            'cCurrentStatus' => 'X',
            'dtLoggedIn' => now(),
        ]);

        $token = $user->createToken('spa')->plainTextToken;

        event(new UserUpdated('created', $user->nUserId));

        return response()->json([
            'message' => 'Registered successfully',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('strEmail', $request->strEmail)->first();

        if (! $user || ! Hash::check($request->strPassword, $user->strPassword)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! $user->isActiveAccount()) {
            return response()->json([
                'message' => 'Your account has been suspended. Please contact an administrator.',
            ], 403);
        }

        $token = $user->createToken('spa')->plainTextToken;

        $user->update([
            'cCurrentStatus' => 'O',
            'dtLoggedIn' => now(),
        ]);

        event(new UserUpdated('status_updated', $user->nUserId));

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $user->update([
            'cCurrentStatus' => 'X',
            'dtLoggedIn' => now(),
        ]);

        event(new UserUpdated('status_updated', $user->nUserId));

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function logoutAll(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->update([
            'cCurrentStatus' => 'X',
            'dtLoggedIn' => now(),
        ]);

        event(new UserUpdated('status_updated', $user->nUserId));

        return response()->json(['message' => 'Logged out from all devices']);
    }

    public function markOffline(Request $request)
    {
        $request->user()->update([
            'cCurrentStatus' => 'X',
            'dtLoggedIn' => now(),
        ]);

        event(new UserUpdated('status_updated', $request->user()->nUserId));

        return response()->json(['message' => 'Marked offline']);
    }

    public function heartbeat(Request $request)
    {
        // Intentionally NOT broadcasting here — heartbeat fires every few seconds
        // per active user, and broadcasting on each call would spam the "users"
        // channel and trigger constant re-fetches for every admin watching the list.
        $request->user()->update([
            'cCurrentStatus' => 'O',
            'dtLastSeen' => now(),
        ]);

        return response()->json(['message' => 'ok']);
    }
}
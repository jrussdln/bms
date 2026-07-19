<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Events\UserUpdated;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('strFName', 'like', "%{$search}%")
                    ->orWhere('strMName', 'like', "%{$search}%")
                    ->orWhere('strLName', 'like', "%{$search}%")
                    ->orWhere('strEName', 'like', "%{$search}%")
                    ->orWhere('strEmail', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('cUserRole')) {
            $query->where('cUserRole', $role);
        }

        if ($accountStatus = $request->query('cAccountStatus')) {
            $query->where('cAccountStatus', $accountStatus);
        }

        if ($currentStatus = $request->query('cCurrentStatus')) {
            $query->where('cCurrentStatus', $currentStatus);
        }

        $perPage = (int) $request->query('per_page', 15);

        return UserResource::collection(
            $query->orderBy('nUserId')->paginate($perPage)
        );
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'strFName' => $request->strFName,
            'strMName' => $request->strMName,
            'strLName' => $request->strLName,
            'strEName' => $request->strEName,
            'strPhoneNumber' => $request->strPhoneNumber,
            'strEmail' => $request->strEmail,
            'strPassword' => $request->strPassword,
            'cUserRole' => $request->input('cUserRole', 'U'),
            'cAccountStatus' => $request->input('cAccountStatus', 'A'),
            'cCurrentStatus' => 'X',
        ]);

        event(new UserUpdated('created', $user->nUserId));

        return response()->json([
            'message' => 'User created successfully',
            'user' => new UserResource($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->fill($request->only([
            'strFName', 'strMName', 'strLName', 'strEName',
            'strPhoneNumber', 'strEmail', 'strPassword',
            'cUserRole', 'cAccountStatus',
        ]));
        $user->save();

        event(new UserUpdated('updated', $user->nUserId));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => new UserResource($user),
        ]);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        $user->update(['cAccountStatus' => $request->cAccountStatus]);

        if ($request->cAccountStatus === 'S') {
            $user->tokens()->delete();
            $user->update(['cCurrentStatus' => 'X']);
        }

        event(new UserUpdated('status_updated', $user->nUserId));

        return response()->json([
            'message' => 'User account status updated successfully',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Upload / replace this user's profile image.
     * Stores the file on the "public" disk under avatars/, deletes
     * the old file (if any), and saves only the filename in strProfileImage.
     */
    public function uploadAvatar(Request $request, User $user)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($user->strProfileImage) {
            Storage::disk('public')->delete('avatars/' . $user->strProfileImage);
        }

        $filename = Str::uuid() . '.' . $request->file('avatar')->extension();
        $request->file('avatar')->storeAs('avatars', $filename, 'public');

        $user->update(['strProfileImage' => $filename]);

        event(new UserUpdated('updated', $user->nUserId));

        return response()->json([
            'message' => 'Profile photo updated successfully',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(User $user)
    {
        $userId = $user->nUserId;

        if ($user->strProfileImage) {
            Storage::disk('public')->delete('avatars/' . $user->strProfileImage);
        }

        $user->tokens()->delete();
        $user->delete();

        event(new UserUpdated('deleted', $userId));

        return response()->json(['message' => 'User deleted successfully']);
    }
    
}
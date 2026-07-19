<?php
use Illuminate\Support\Facades\Schedule;
use App\Models\User;

Schedule::call(function () {
    User::where('cCurrentStatus', 'O')
        ->where('dtLastSeen', '<', now()->subMinutes(1))
        ->update([
            'cCurrentStatus' => 'X',
            'dtLoggedIn' => now(),
        ]);
})->everyMinute();
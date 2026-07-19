<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/heartbeat', [AuthController::class, 'heartbeat']);
    Route::post('/mark-offline', [AuthController::class, 'markOffline']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    Route::apiResource('records', FinanceController::class);
    Route::post('/users/{user}/avatar', [UserController::class, 'uploadAvatar']);
    Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
    Route::apiResource('users', UserController::class);
    Route::post('/chat', [ChatController::class, 'send']);
});

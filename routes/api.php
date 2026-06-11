<?php

use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\SessionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
]));

Route::prefix('auth')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', [SessionController::class, 'store']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [SessionController::class, 'user']);
        Route::post('/logout', [SessionController::class, 'destroy']);
    });
});

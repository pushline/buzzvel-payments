<?php

use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\SessionController;
use App\Http\Controllers\Api\PaymentRequestController;
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

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('payment-requests', PaymentRequestController::class)
        ->only(['index', 'store', 'show']);
    Route::post('payment-requests/{payment_request}/approve', [PaymentRequestController::class, 'approve']);
    Route::post('payment-requests/{payment_request}/reject', [PaymentRequestController::class, 'reject']);
});

<?php

use App\Http\Controllers\PaymentRequestController;
use App\Http\Controllers\ProfileController;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', fn () => redirect()->route('payment-requests.index'))
    ->middleware(['auth'])
    ->name('dashboard');

if (app()->environment('local')) {
    Route::get('/dev/mail-preview/password-reset', function (Request $request) {
        $user = User::query()
            ->where('email', $request->string('email')->toString())
            ->firstOrFail();

        return (new ResetPassword($request->string('token', 'preview-token')->toString()))
            ->toMail($user)
            ->render();
    })->name('dev.mail-preview.password-reset');
}

Route::middleware('auth')->group(function () {
    Route::get('/payment-requests', [PaymentRequestController::class, 'index'])->name('payment-requests.index');
    Route::get('/payment-requests/create', [PaymentRequestController::class, 'create'])->name('payment-requests.create');
    Route::post('/payment-requests', [PaymentRequestController::class, 'store'])->name('payment-requests.store');
    Route::get('/payment-requests/{paymentRequest}', [PaymentRequestController::class, 'show'])->name('payment-requests.show');
    Route::post('/payment-requests/{paymentRequest}/approve', [PaymentRequestController::class, 'approve'])->name('payment-requests.approve');
    Route::post('/payment-requests/{paymentRequest}/reject', [PaymentRequestController::class, 'reject'])->name('payment-requests.reject');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

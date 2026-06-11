<?php

namespace App\Policies;

use App\Models\PaymentRequest;
use App\Models\User;

class PaymentRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PaymentRequest $paymentRequest): bool
    {
        return $user->isFinance() || $paymentRequest->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isEmployee();
    }

    public function review(User $user, PaymentRequest $paymentRequest): bool
    {
        return $user->isFinance() && $paymentRequest->status->isPending();
    }
}

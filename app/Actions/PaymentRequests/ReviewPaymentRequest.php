<?php

namespace App\Actions\PaymentRequests;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class ReviewPaymentRequest
{
    public function handle(PaymentRequest $paymentRequest, User $reviewer, PaymentRequestStatus $status): PaymentRequest
    {
        return DB::transaction(function () use ($paymentRequest, $reviewer, $status) {
            $lockedRequest = PaymentRequest::query()
                ->lockForUpdate()
                ->findOrFail($paymentRequest->id);

            if (! $lockedRequest->status->isPending()) {
                throw new AuthorizationException('Only pending payment requests can be reviewed.');
            }

            $lockedRequest->forceFill([
                'status' => $status,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ])->save();

            return $lockedRequest->refresh();
        });
    }
}

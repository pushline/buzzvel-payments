<?php

namespace App\Console\Commands;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use Illuminate\Console\Command;

class ExpirePendingPaymentRequests extends Command
{
    protected $signature = 'payments:expire-pending';

    protected $description = 'Expire payment requests that have remained pending for more than 48 hours';

    public function handle(): int
    {
        $cutoff = now()->subHours(48);
        $expired = 0;

        PaymentRequest::query()
            ->where('status', PaymentRequestStatus::Pending->value)
            ->where('created_at', '<', $cutoff)
            ->select('id')
            ->chunkById(500, function ($paymentRequests) use (&$expired) {
                $expired += PaymentRequest::query()
                    ->whereKey($paymentRequests->pluck('id'))
                    ->where('status', PaymentRequestStatus::Pending->value)
                    ->update([
                        'status' => PaymentRequestStatus::Expired->value,
                        'updated_at' => now(),
                    ]);
            });

        $this->info("Expired {$expired} pending payment request(s).");

        return self::SUCCESS;
    }
}

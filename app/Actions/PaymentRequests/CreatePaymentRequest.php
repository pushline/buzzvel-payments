<?php

namespace App\Actions\PaymentRequests;

use App\Contracts\ExchangeRateProvider;
use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Services\ExchangeRates\EurAmountConverter;
use Illuminate\Support\Facades\DB;

class CreatePaymentRequest
{
    public function __construct(
        private readonly ExchangeRateProvider $exchangeRates,
        private readonly EurAmountConverter $converter,
    ) {}

    public function handle(User $requester, string $amount, string $purpose): PaymentRequest
    {
        $quote = $this->exchangeRates->getEurRate($requester->currency_code);
        $eurAmount = $this->converter->fromLocalAmount($amount, $quote->rate);

        return DB::transaction(fn () => PaymentRequest::forceCreate([
            'user_id' => $requester->id,
            'local_amount' => $amount,
            'local_currency' => $requester->currency_code,
            'purpose' => $purpose,
            'exchange_rate' => $quote->rate,
            'eur_amount' => $eurAmount,
            'rate_source' => $quote->source,
            'rate_fetched_at' => $quote->fetchedAt,
            'status' => PaymentRequestStatus::Pending,
        ]));
    }
}

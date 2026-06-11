<?php

namespace App\Services\ExchangeRates;

use App\Contracts\ExchangeRateProvider;
use App\Data\ExchangeRateQuote;
use App\Exceptions\ExchangeRateUnavailable;
use Carbon\CarbonImmutable;
use Illuminate\Http\Client\Factory as HttpFactory;
use Throwable;

class ExchangeRateApiProvider implements ExchangeRateProvider
{
    public function __construct(
        private readonly HttpFactory $http,
        private readonly string $baseUrl,
        private readonly ?string $apiKey,
        private readonly int $timeout,
        private readonly string $source,
    ) {}

    public function getEurRate(string $currencyCode): ExchangeRateQuote
    {
        if (blank($this->apiKey)) {
            throw ExchangeRateUnavailable::missingConfiguration();
        }

        $currencyCode = mb_strtoupper($currencyCode);

        try {
            $response = $this->http
                ->acceptJson()
                ->timeout($this->timeout)
                ->get(sprintf(
                    '%s/v6/%s/latest/EUR',
                    rtrim($this->baseUrl, '/'),
                    rawurlencode($this->apiKey),
                ))
                ->throw();
        } catch (Throwable $exception) {
            throw ExchangeRateUnavailable::providerFailure($exception);
        }

        $rate = $response->json("conversion_rates.{$currencyCode}");
        $updatedAt = $response->json('time_last_update_unix');

        if (
            $response->json('result') !== 'success'
            || $response->json('base_code') !== 'EUR'
            || ! $this->isPositiveDecimal($rate)
            || ! is_int($updatedAt)
            || $updatedAt <= 0
        ) {
            throw ExchangeRateUnavailable::invalidResponse();
        }

        return new ExchangeRateQuote(
            baseCurrency: 'EUR',
            targetCurrency: $currencyCode,
            rate: (string) $rate,
            source: $this->source,
            fetchedAt: CarbonImmutable::createFromTimestampUTC($updatedAt),
        );
    }

    private function isPositiveDecimal(mixed $value): bool
    {
        $decimal = (string) $value;

        return preg_match('/^\d+(?:\.\d+)?$/', $decimal) === 1
            && bccomp($decimal, '0', 10) === 1;
    }
}

<?php

namespace App\Data;

use Carbon\CarbonImmutable;

readonly class ExchangeRateQuote
{
    public function __construct(
        public string $baseCurrency,
        public string $targetCurrency,
        public string $rate,
        public string $source,
        public CarbonImmutable $fetchedAt,
    ) {}
}

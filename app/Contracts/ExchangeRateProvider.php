<?php

namespace App\Contracts;

use App\Data\ExchangeRateQuote;

interface ExchangeRateProvider
{
    public function getEurRate(string $currencyCode): ExchangeRateQuote;
}

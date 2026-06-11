<?php

namespace App\Exceptions;

use RuntimeException;
use Throwable;

class ExchangeRateUnavailable extends RuntimeException
{
    public static function providerFailure(?Throwable $previous = null): self
    {
        return new self('The exchange-rate provider is currently unavailable.', previous: $previous);
    }

    public static function invalidResponse(): self
    {
        return new self('The exchange-rate provider returned an invalid response.');
    }

    public static function missingConfiguration(): self
    {
        return new self('The exchange-rate provider is not configured.');
    }
}

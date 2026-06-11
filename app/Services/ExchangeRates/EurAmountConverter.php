<?php

namespace App\Services\ExchangeRates;

use InvalidArgumentException;

class EurAmountConverter
{
    public const SCALE = 4;

    public function fromLocalAmount(string $localAmount, string $eurToLocalRate): string
    {
        if (
            ! $this->isDecimal($localAmount)
            || ! $this->isDecimal($eurToLocalRate)
            || bccomp($localAmount, '0', self::SCALE) !== 1
            || bccomp($eurToLocalRate, '0', 10) !== 1
        ) {
            throw new InvalidArgumentException('Amounts and exchange rates must be positive decimals.');
        }

        $unrounded = bcdiv($localAmount, $eurToLocalRate, self::SCALE + 1);
        $halfUnit = '0.'.str_repeat('0', self::SCALE).'5';

        return bcadd($unrounded, $halfUnit, self::SCALE);
    }

    private function isDecimal(string $value): bool
    {
        return preg_match('/^\d+(?:\.\d+)?$/', $value) === 1;
    }
}

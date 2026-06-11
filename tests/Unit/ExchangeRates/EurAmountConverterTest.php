<?php

namespace Tests\Unit\ExchangeRates;

use App\Services\ExchangeRates\EurAmountConverter;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class EurAmountConverterTest extends TestCase
{
    public function test_it_converts_local_amounts_to_eur_with_half_up_rounding(): void
    {
        $converter = new EurAmountConverter;

        $this->assertSame('20.0000', $converter->fromLocalAmount('120.5000', '6.0250000000'));
        $this->assertSame('0.3333', $converter->fromLocalAmount('1', '3'));
        $this->assertSame('0.6667', $converter->fromLocalAmount('2', '3'));
        $this->assertSame('2.3457', $converter->fromLocalAmount('2.34565', '1'));
    }

    public function test_it_rejects_invalid_or_non_positive_values(): void
    {
        $converter = new EurAmountConverter;

        foreach ([['nope', '1'], ['1', 'nope'], ['1e2', '1'], ['1', '1e2'], ['0', '1'], ['1', '0'], ['-1', '1'], ['1', '-1']] as [$amount, $rate]) {
            try {
                $converter->fromLocalAmount($amount, $rate);
                $this->fail('Expected invalid conversion values to be rejected.');
            } catch (InvalidArgumentException $exception) {
                $this->assertSame('Amounts and exchange rates must be positive decimals.', $exception->getMessage());
            }
        }
    }
}

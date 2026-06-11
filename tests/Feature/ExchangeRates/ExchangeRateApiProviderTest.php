<?php

namespace Tests\Feature\ExchangeRates;

use App\Contracts\ExchangeRateProvider;
use App\Exceptions\ExchangeRateUnavailable;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateApiProviderTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.exchange_rate_api', [
            'base_url' => 'https://rates.test',
            'api_key' => 'test-key',
            'timeout' => 3,
            'source' => 'ExchangeRate-API',
        ]);

        Http::preventStrayRequests();
    }

    public function test_it_fetches_a_eur_to_local_currency_quote(): void
    {
        Http::fake([
            'https://rates.test/v6/test-key/latest/EUR' => Http::response([
                'result' => 'success',
                'base_code' => 'EUR',
                'time_last_update_unix' => 1_717_977_600,
                'conversion_rates' => [
                    'BRL' => 5.812345,
                ],
            ]),
        ]);

        $quote = app(ExchangeRateProvider::class)->getEurRate('brl');

        $this->assertSame('EUR', $quote->baseCurrency);
        $this->assertSame('BRL', $quote->targetCurrency);
        $this->assertSame('5.812345', $quote->rate);
        $this->assertSame('ExchangeRate-API', $quote->source);
        $this->assertSame('2024-06-10T00:00:00+00:00', $quote->fetchedAt->toIso8601String());

        Http::assertSent(fn (Request $request) => $request->url() === 'https://rates.test/v6/test-key/latest/EUR');
    }

    public function test_it_rejects_malformed_missing_and_non_positive_rates(): void
    {
        foreach ([
            ['result' => 'error', 'error-type' => 'quota-reached'],
            ['result' => 'success', 'base_code' => 'USD', 'time_last_update_unix' => 1_717_977_600, 'conversion_rates' => ['BRL' => 5]],
            ['result' => 'success', 'base_code' => 'EUR', 'time_last_update_unix' => 1_717_977_600, 'conversion_rates' => []],
            ['result' => 'success', 'base_code' => 'EUR', 'time_last_update_unix' => 1_717_977_600, 'conversion_rates' => ['BRL' => 0]],
            ['result' => 'success', 'base_code' => 'EUR', 'time_last_update_unix' => 1_717_977_600, 'conversion_rates' => ['BRL' => '1e-3']],
            ['result' => 'success', 'base_code' => 'EUR', 'time_last_update_unix' => 'invalid', 'conversion_rates' => ['BRL' => 5]],
        ] as $response) {
            Http::fake([
                'https://rates.test/*' => Http::response($response),
            ]);

            try {
                app(ExchangeRateProvider::class)->getEurRate('BRL');
                $this->fail('Expected an invalid provider response to be rejected.');
            } catch (ExchangeRateUnavailable $exception) {
                $this->assertSame('The exchange-rate provider returned an invalid response.', $exception->getMessage());
            }
        }
    }

    public function test_it_converts_http_and_connection_failures_to_a_domain_exception(): void
    {
        Http::fake([
            'https://rates.test/*' => Http::response([], 503),
        ]);

        $this->expectException(ExchangeRateUnavailable::class);
        $this->expectExceptionMessage('The exchange-rate provider is currently unavailable.');

        app(ExchangeRateProvider::class)->getEurRate('BRL');
    }

    public function test_it_converts_connection_failures_to_a_domain_exception(): void
    {
        Http::fake([
            'https://rates.test/*' => Http::failedConnection(),
        ]);

        $this->expectException(ExchangeRateUnavailable::class);
        $this->expectExceptionMessage('The exchange-rate provider is currently unavailable.');

        app(ExchangeRateProvider::class)->getEurRate('BRL');
    }

    public function test_it_rejects_missing_provider_configuration_without_an_http_request(): void
    {
        config()->set('services.exchange_rate_api.api_key', null);

        $this->expectException(ExchangeRateUnavailable::class);
        $this->expectExceptionMessage('The exchange-rate provider is not configured.');

        app(ExchangeRateProvider::class)->getEurRate('BRL');
    }
}

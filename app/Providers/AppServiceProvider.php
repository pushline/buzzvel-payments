<?php

namespace App\Providers;

use App\Contracts\ExchangeRateProvider;
use App\Services\ExchangeRates\ExchangeRateApiProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ExchangeRateProvider::class, function (Application $app) {
            $config = $app->make('config')->get('services.exchange_rate_api');

            return new ExchangeRateApiProvider(
                http: $app->make(Factory::class),
                baseUrl: $config['base_url'],
                apiKey: $config['api_key'],
                timeout: $config['timeout'],
                source: $config['source'],
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}

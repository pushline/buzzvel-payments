<?php

namespace Tests\Feature\Database;

use App\Enums\PaymentRequestStatus;
use App\Enums\UserRole;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Services\ExchangeRates\EurAmountConverter;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate:fresh')->assertSuccessful();
    }

    public function test_it_seeds_demo_users_across_countries_and_currencies(): void
    {
        $this->seed(DatabaseSeeder::class);

        $employees = User::query()->where('role', UserRole::Employee->value)->get();
        $finance = User::query()->where('role', UserRole::Finance->value)->firstOrFail();

        $this->assertCount(5, $employees);
        $this->assertCount(5, $employees->pluck('country_code')->unique());
        $this->assertCount(5, $employees->pluck('currency_code')->unique());
        $this->assertSame('finance@example.com', $finance->email);
        $this->assertTrue(Hash::check('password', $finance->password));
        $this->assertTrue(Hash::check('password', $employees->first()->password));
    }

    public function test_it_seeds_representative_requests_with_valid_rate_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $paymentRequests = PaymentRequest::query()->get();
        $statuses = $paymentRequests->pluck('status');
        $converter = app(EurAmountConverter::class);

        $this->assertCount(5, $paymentRequests);
        $this->assertTrue($statuses->contains(PaymentRequestStatus::Pending));
        $this->assertTrue($statuses->contains(PaymentRequestStatus::Approved));
        $this->assertTrue($statuses->contains(PaymentRequestStatus::Rejected));
        $this->assertTrue($statuses->contains(PaymentRequestStatus::Expired));

        foreach ($paymentRequests as $paymentRequest) {
            $this->assertSame($paymentRequest->requester->currency_code, $paymentRequest->local_currency);
            $this->assertSame('seed-demo', $paymentRequest->rate_source);
            $this->assertSame(
                $converter->fromLocalAmount($paymentRequest->local_amount, $paymentRequest->exchange_rate),
                $paymentRequest->eur_amount,
            );
        }
    }

    public function test_seeding_is_repeatable_after_a_fresh_database_migration(): void
    {
        $this->artisan('migrate:fresh', ['--seed' => true])
            ->assertSuccessful();

        $this->artisan('migrate:fresh', ['--seed' => true])
            ->assertSuccessful();

        $this->assertDatabaseCount('users', 6);
        $this->assertDatabaseCount('payment_requests', 5);
    }

    public function test_seeding_can_be_repeated_without_resetting_the_database(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('users', 6);
        $this->assertDatabaseCount('payment_requests', 5);
    }
}

<?php

namespace Database\Seeders;

use App\Enums\PaymentRequestStatus;
use App\Enums\UserRole;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Services\ExchangeRates\EurAmountConverter;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $users = collect([
                ['name' => 'Ana Silva', 'email' => 'ana@example.com', 'country_code' => 'BR', 'currency_code' => 'BRL'],
                ['name' => 'James Carter', 'email' => 'james@example.com', 'country_code' => 'GB', 'currency_code' => 'GBP'],
                ['name' => 'Sofia Martinez', 'email' => 'sofia@example.com', 'country_code' => 'MX', 'currency_code' => 'MXN'],
                ['name' => 'Haruto Sato', 'email' => 'haruto@example.com', 'country_code' => 'JP', 'currency_code' => 'JPY'],
                ['name' => 'Priya Sharma', 'email' => 'priya@example.com', 'country_code' => 'IN', 'currency_code' => 'INR'],
            ])->mapWithKeys(function (array $employee) {
                $user = $this->updateDemoUser($employee, UserRole::Employee);

                return [$employee['email'] => $user];
            });

            $finance = $this->updateDemoUser([
                'name' => 'Finance Reviewer',
                'email' => 'finance@example.com',
                'country_code' => 'PT',
                'currency_code' => 'EUR',
            ], UserRole::Finance);

            PaymentRequest::query()->where('rate_source', 'seed-demo')->delete();

            $this->createPayment($users['ana@example.com'], '850.0000', '5.9500000000', 'Client workshop travel', PaymentRequestStatus::Pending);
            $this->createPayment($users['james@example.com'], '480.0000', '0.8500000000', 'Annual software licenses', PaymentRequestStatus::Approved, $finance);
            $this->createPayment($users['sofia@example.com'], '12500.0000', '20.1000000000', 'Regional conference venue', PaymentRequestStatus::Rejected, $finance);
            $this->createPayment($users['haruto@example.com'], '90000.0000', '166.5000000000', 'Team equipment purchase', PaymentRequestStatus::Expired);
            $this->createPayment($users['priya@example.com'], '45000.0000', '92.0000000000', 'Professional training', PaymentRequestStatus::Pending);
        });
    }

    private function updateDemoUser(array $attributes, UserRole $role): User
    {
        return User::query()->updateOrCreate(
            ['email' => $attributes['email']],
            [
                ...$attributes,
                'role' => $role->value,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
        );
    }

    private function createPayment(
        User $requester,
        string $localAmount,
        string $rate,
        string $purpose,
        PaymentRequestStatus $status,
        ?User $reviewer = null,
    ): void {
        $reviewed = in_array($status, [PaymentRequestStatus::Approved, PaymentRequestStatus::Rejected], true);

        PaymentRequest::forceCreate([
            'user_id' => $requester->id,
            'local_amount' => $localAmount,
            'local_currency' => $requester->currency_code,
            'purpose' => $purpose,
            'exchange_rate' => $rate,
            'eur_amount' => app(EurAmountConverter::class)->fromLocalAmount($localAmount, $rate),
            'rate_source' => 'seed-demo',
            'rate_fetched_at' => CarbonImmutable::parse('2026-06-08T09:00:00Z'),
            'status' => $status,
            'reviewed_by' => $reviewed ? $reviewer?->id : null,
            'reviewed_at' => $reviewed ? CarbonImmutable::parse('2026-06-08T11:00:00Z') : null,
            'created_at' => $status === PaymentRequestStatus::Expired
                ? CarbonImmutable::parse('2026-06-05T09:00:00Z')
                : CarbonImmutable::parse('2026-06-08T09:00:00Z'),
            'updated_at' => CarbonImmutable::parse('2026-06-08T11:00:00Z'),
        ]);
    }
}

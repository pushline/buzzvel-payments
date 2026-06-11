<?php

namespace Database\Factories;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentRequest>
 */
class PaymentRequestFactory extends Factory
{
    protected $model = PaymentRequest::class;

    public function definition(): array
    {
        $rate = fake()->randomFloat(6, 0.5, 8);
        $localAmount = fake()->randomFloat(2, 10, 5000);

        return [
            'user_id' => User::factory()->employee(),
            'local_amount' => $localAmount,
            'local_currency' => 'BRL',
            'purpose' => fake()->sentence(),
            'exchange_rate' => $rate,
            'eur_amount' => round($localAmount / $rate, 4),
            'rate_source' => 'factory',
            'rate_fetched_at' => now(),
            'status' => PaymentRequestStatus::Pending,
        ];
    }

    public function approved(?User $reviewer = null): static
    {
        return $this->reviewed(PaymentRequestStatus::Approved, $reviewer);
    }

    public function rejected(?User $reviewer = null): static
    {
        return $this->reviewed(PaymentRequestStatus::Rejected, $reviewer);
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => PaymentRequestStatus::Expired,
        ]);
    }

    private function reviewed(PaymentRequestStatus $status, ?User $reviewer): static
    {
        return $this->state(fn () => [
            'status' => $status,
            'reviewed_by' => $reviewer?->id ?? User::factory()->finance(),
            'reviewed_at' => now(),
        ]);
    }
}

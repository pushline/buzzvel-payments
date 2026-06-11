<?php

namespace Tests\Feature\Domain;

use App\Enums\PaymentRequestStatus;
use App\Enums\UserRole;
use App\Models\PaymentRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentRequestModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_and_payment_request_enums_are_cast(): void
    {
        $user = User::factory()->finance()->create();
        $paymentRequest = PaymentRequest::factory()->for($user, 'requester')->create();

        $this->assertSame(UserRole::Finance, $user->role);
        $this->assertSame(PaymentRequestStatus::Pending, $paymentRequest->status);
        $this->assertTrue($paymentRequest->status->isPending());
    }

    public function test_payment_request_relationships_and_decimal_casts_are_available(): void
    {
        $requester = User::factory()->employee()->create();
        $reviewer = User::factory()->finance()->create();

        $paymentRequest = PaymentRequest::factory()
            ->for($requester, 'requester')
            ->approved($reviewer)
            ->create([
                'local_amount' => '120.5000',
                'exchange_rate' => '6.0250000000',
                'eur_amount' => '20.0000',
            ]);

        $this->assertTrue($requester->paymentRequests->contains($paymentRequest));
        $this->assertTrue($reviewer->reviewedPaymentRequests->contains($paymentRequest));
        $this->assertTrue($paymentRequest->requester->is($requester));
        $this->assertTrue($paymentRequest->reviewer->is($reviewer));
        $this->assertSame('120.5000', $paymentRequest->local_amount);
        $this->assertSame('6.0250000000', $paymentRequest->exchange_rate);
        $this->assertSame('20.0000', $paymentRequest->eur_amount);
        $this->assertInstanceOf(CarbonImmutable::class, $paymentRequest->rate_fetched_at);
        $this->assertInstanceOf(CarbonImmutable::class, $paymentRequest->reviewed_at);
    }

    public function test_immutable_and_server_derived_fields_are_not_mass_assignable(): void
    {
        $paymentRequest = new PaymentRequest([
            'purpose' => 'Conference travel',
            'user_id' => 999,
            'local_amount' => '999.0000',
            'local_currency' => 'USD',
            'exchange_rate' => '2.0000000000',
            'eur_amount' => '499.5000',
            'rate_source' => 'untrusted',
            'rate_fetched_at' => now(),
            'status' => PaymentRequestStatus::Approved,
            'reviewed_by' => 999,
            'reviewed_at' => now(),
        ]);

        $this->assertSame('Conference travel', $paymentRequest->purpose);
        $this->assertNull($paymentRequest->user_id);
        $this->assertNull($paymentRequest->local_amount);
        $this->assertNull($paymentRequest->local_currency);
        $this->assertNull($paymentRequest->exchange_rate);
        $this->assertNull($paymentRequest->eur_amount);
        $this->assertNull($paymentRequest->rate_source);
        $this->assertNull($paymentRequest->rate_fetched_at);
        $this->assertNull($paymentRequest->status);
        $this->assertNull($paymentRequest->reviewed_by);
        $this->assertNull($paymentRequest->reviewed_at);
    }
}

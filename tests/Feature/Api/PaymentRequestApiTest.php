<?php

namespace Tests\Feature\Api;

use App\Actions\PaymentRequests\CreatePaymentRequest;
use App\Contracts\ExchangeRateProvider;
use App\Data\ExchangeRateQuote;
use App\Enums\PaymentRequestStatus;
use App\Exceptions\ExchangeRateUnavailable;
use App\Models\PaymentRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery\MockInterface;
use RuntimeException;
use Tests\TestCase;

class PaymentRequestApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_create_a_payment_request_from_server_derived_values(): void
    {
        CarbonImmutable::setTestNow('2026-06-11T12:00:00Z');
        $employee = User::factory()->employee()->create([
            'currency_code' => 'BRL',
        ]);
        Sanctum::actingAs($employee);
        $this->fakeRate('BRL', '6.0250000000', '2026-06-11T10:00:00Z');

        $response = $this->postJson('/api/payment-requests', [
            'amount' => '120.5000',
            'purpose' => 'Conference travel',
            'local_currency' => 'USD',
            'exchange_rate' => '1',
            'eur_amount' => '120.5000',
            'status' => PaymentRequestStatus::Approved->value,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.requester.id', $employee->id)
            ->assertJsonPath('data.local_amount', '120.5000')
            ->assertJsonPath('data.local_currency', 'BRL')
            ->assertJsonPath('data.eur_amount', '20.0000')
            ->assertJsonPath('data.exchange_rate.rate', '6.0250000000')
            ->assertJsonPath('data.exchange_rate.source', 'test-provider')
            ->assertJsonPath('data.status', PaymentRequestStatus::Pending->value)
            ->assertJsonPath('data.reviewer', null)
            ->assertJsonPath('data.reviewed_at', null);

        $this->assertDatabaseHas('payment_requests', [
            'user_id' => $employee->id,
            'local_currency' => 'BRL',
            'purpose' => 'Conference travel',
            'rate_source' => 'test-provider',
            'status' => PaymentRequestStatus::Pending->value,
            'reviewed_by' => null,
        ]);
    }

    public function test_payment_creation_validates_input_and_is_employee_only(): void
    {
        $employee = User::factory()->employee()->create();
        Sanctum::actingAs($employee);

        $this->postJson('/api/payment-requests', [
            'amount' => '0',
            'purpose' => '',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['amount', 'purpose']);

        Sanctum::actingAs(User::factory()->finance()->create());

        $this->postJson('/api/payment-requests', [
            'amount' => '100',
            'purpose' => 'Should be forbidden',
        ])
            ->assertForbidden()
            ->assertJsonPath('error.code', 'FORBIDDEN');

        $this->assertDatabaseCount('payment_requests', 0);
    }

    public function test_provider_failure_returns_503_and_does_not_create_a_record(): void
    {
        Sanctum::actingAs(User::factory()->employee()->create());
        $this->mock(ExchangeRateProvider::class, function (MockInterface $mock) {
            $mock->shouldReceive('getEurRate')
                ->once()
                ->andThrow(ExchangeRateUnavailable::providerFailure());
        });

        $this->postJson('/api/payment-requests', [
            'amount' => '100',
            'purpose' => 'Conference travel',
        ])
            ->assertServiceUnavailable()
            ->assertJson([
                'message' => 'The exchange-rate provider is currently unavailable.',
            ])
            ->assertJsonPath('error.code', 'EXCHANGE_RATE_UNAVAILABLE');

        $this->assertDatabaseCount('payment_requests', 0);
    }

    public function test_payment_creation_rolls_back_when_persistence_fails(): void
    {
        $employee = User::factory()->employee()->create();
        $this->fakeRate('BRL', '5.0000000000', '2026-06-11T10:00:00Z');
        PaymentRequest::created(fn () => throw new RuntimeException('Simulated persistence failure.'));

        try {
            app(CreatePaymentRequest::class)->handle($employee, '100.0000', 'Conference travel');
            $this->fail('Expected the simulated persistence failure.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Simulated persistence failure.', $exception->getMessage());
        }

        $this->assertDatabaseCount('payment_requests', 0);
    }

    public function test_employee_lists_and_views_only_their_own_requests_with_status_filtering(): void
    {
        $employee = User::factory()->employee()->create();
        $otherEmployee = User::factory()->employee()->create();
        $pending = PaymentRequest::factory()->for($employee, 'requester')->create();
        $approved = PaymentRequest::factory()->for($employee, 'requester')->approved()->create();
        $other = PaymentRequest::factory()->for($otherEmployee, 'requester')->create();
        Sanctum::actingAs($employee);

        $response = $this->getJson('/api/payment-requests')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $pending->id])
            ->assertJsonFragment(['id' => $approved->id]);

        $this->assertNotContains($other->id, collect($response->json('data'))->pluck('id'));

        $this->getJson('/api/payment-requests?status=approved')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $approved->id);

        $this->getJson("/api/payment-requests/{$pending->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $pending->id);

        $this->getJson("/api/payment-requests/{$other->id}")
            ->assertForbidden();
    }

    public function test_finance_lists_and_views_all_requests_with_status_filtering(): void
    {
        $finance = User::factory()->finance()->create();
        $pending = PaymentRequest::factory()->create();
        $rejected = PaymentRequest::factory()->rejected($finance)->create();
        Sanctum::actingAs($finance);

        $this->getJson('/api/payment-requests')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/payment-requests?status=rejected')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $rejected->id);

        $this->getJson("/api/payment-requests/{$pending->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $pending->id);
    }

    public function test_invalid_status_filter_and_anonymous_access_return_meaningful_errors(): void
    {
        $this->getJson('/api/payment-requests')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->employee()->create());

        $this->getJson('/api/payment-requests?status=unknown')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status')
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');

        $this->getJson('/api/payment-requests/999999')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'NOT_FOUND');
    }

    public function test_finance_can_approve_or_reject_pending_requests_only(): void
    {
        CarbonImmutable::setTestNow('2026-06-11T12:00:00Z');
        $finance = User::factory()->finance()->create();
        $approveRequest = PaymentRequest::factory()->create();
        $rejectRequest = PaymentRequest::factory()->create();
        Sanctum::actingAs($finance);

        $this->postJson("/api/payment-requests/{$approveRequest->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', PaymentRequestStatus::Approved->value)
            ->assertJsonPath('data.reviewer.id', $finance->id)
            ->assertJsonPath('data.reviewed_at', '2026-06-11T12:00:00+00:00');

        $this->postJson("/api/payment-requests/{$rejectRequest->id}/reject")
            ->assertOk()
            ->assertJsonPath('data.status', PaymentRequestStatus::Rejected->value)
            ->assertJsonPath('data.reviewer.id', $finance->id);

        $this->postJson("/api/payment-requests/{$approveRequest->id}/reject")
            ->assertForbidden();
    }

    public function test_employees_cannot_review_requests_and_review_preserves_immutable_values(): void
    {
        $employee = User::factory()->employee()->create();
        $paymentRequest = PaymentRequest::factory()->for($employee, 'requester')->create();
        $originalValues = $paymentRequest->only([
            'user_id',
            'local_amount',
            'local_currency',
            'purpose',
            'exchange_rate',
            'eur_amount',
            'rate_source',
            'rate_fetched_at',
        ]);

        Sanctum::actingAs($employee);
        $this->postJson("/api/payment-requests/{$paymentRequest->id}/approve")->assertForbidden();

        Sanctum::actingAs(User::factory()->finance()->create());
        $this->postJson("/api/payment-requests/{$paymentRequest->id}/approve")->assertOk();

        $paymentRequest->refresh();

        foreach ($originalValues as $key => $value) {
            $this->assertEquals($value, $paymentRequest->{$key});
        }
    }

    public function test_no_general_update_or_delete_api_is_exposed(): void
    {
        $paymentRequest = PaymentRequest::factory()->create();
        Sanctum::actingAs(User::factory()->finance()->create());

        $this->putJson("/api/payment-requests/{$paymentRequest->id}", [
            'amount' => '1',
        ])
            ->assertMethodNotAllowed()
            ->assertJsonPath('error.code', 'METHOD_NOT_ALLOWED');

        $this->deleteJson("/api/payment-requests/{$paymentRequest->id}")
            ->assertMethodNotAllowed()
            ->assertJsonPath('error.code', 'METHOD_NOT_ALLOWED');
    }

    private function fakeRate(string $currency, string $rate, string $fetchedAt): void
    {
        $this->mock(ExchangeRateProvider::class, function (MockInterface $mock) use ($currency, $rate, $fetchedAt) {
            $mock->shouldReceive('getEurRate')
                ->once()
                ->with($currency)
                ->andReturn(new ExchangeRateQuote(
                    baseCurrency: 'EUR',
                    targetCurrency: $currency,
                    rate: $rate,
                    source: 'test-provider',
                    fetchedAt: CarbonImmutable::parse($fetchedAt),
                ));
        });
    }
}

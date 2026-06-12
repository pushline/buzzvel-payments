<?php

namespace Tests\Feature\Web;

use App\Contracts\ExchangeRateProvider;
use App\Data\ExchangeRateQuote;
use App\Enums\PaymentRequestStatus;
use App\Exceptions\ExchangeRateUnavailable;
use App\Models\PaymentRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class PaymentRequestPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_index_lists_only_their_own_requests_with_summary(): void
    {
        $employee = User::factory()->employee()->create(['currency_code' => 'BRL']);
        $other = User::factory()->employee()->create();

        PaymentRequest::factory()->for($employee, 'requester')->count(2)->create([
            'status' => PaymentRequestStatus::Pending,
        ]);
        PaymentRequest::factory()->for($other, 'requester')->create();

        $this->actingAs($employee)
            ->get(route('payment-requests.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('PaymentRequests/Index')
                ->has('paymentRequests', 2)
                ->where('paymentRequests.0.requester.name', $employee->name)
                ->where('summary.total', 2)
                ->where('summary.pending', 2)
                ->where('can.create', true)
            );
    }

    public function test_finance_index_lists_all_requests_and_can_filter_by_status(): void
    {
        $finance = User::factory()->finance()->create();
        PaymentRequest::factory()->create(['status' => PaymentRequestStatus::Pending]);
        PaymentRequest::factory()->create(['status' => PaymentRequestStatus::Approved]);

        $this->actingAs($finance)
            ->get(route('payment-requests.index'))
            ->assertInertia(fn ($page) => $page
                ->has('paymentRequests', 2)
                ->where('can.create', false)
            );

        $this->actingAs($finance)
            ->get(route('payment-requests.index', ['status' => 'approved']))
            ->assertInertia(fn ($page) => $page
                ->has('paymentRequests', 1)
                ->where('filters.status', 'approved')
                ->where('paymentRequests.0.status', 'approved')
            );
    }

    public function test_only_employees_can_open_the_create_page(): void
    {
        $this->actingAs(User::factory()->employee()->create())
            ->get(route('payment-requests.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('PaymentRequests/Create'));

        $this->actingAs(User::factory()->finance()->create())
            ->get(route('payment-requests.create'))
            ->assertForbidden();
    }

    public function test_employee_can_submit_a_request_and_is_redirected_to_detail(): void
    {
        $employee = User::factory()->employee()->create(['currency_code' => 'BRL']);
        $this->fakeRate('BRL', '6.0000000000', '2026-06-11T10:00:00Z');

        $response = $this->actingAs($employee)->post(route('payment-requests.store'), [
            'amount' => '120.0000',
            'purpose' => 'Conference travel',
        ]);

        $request = PaymentRequest::firstOrFail();
        $response->assertRedirect(route('payment-requests.show', $request))
            ->assertSessionHas('success');

        $this->assertSame('20.0000', $request->eur_amount);
        $this->assertSame(PaymentRequestStatus::Pending, $request->status);
    }

    public function test_provider_failure_redirects_back_with_error_and_creates_no_record(): void
    {
        $employee = User::factory()->employee()->create();
        $this->mock(ExchangeRateProvider::class, function (MockInterface $mock) {
            $mock->shouldReceive('getEurRate')->once()
                ->andThrow(ExchangeRateUnavailable::providerFailure());
        });

        $this->actingAs($employee)->post(route('payment-requests.store'), [
            'amount' => '100',
            'purpose' => 'Conference travel',
        ])->assertRedirect()->assertSessionHas('error');

        $this->assertDatabaseCount('payment_requests', 0);
    }

    public function test_store_validates_input(): void
    {
        $this->actingAs(User::factory()->employee()->create())
            ->post(route('payment-requests.store'), ['amount' => '0', 'purpose' => ''])
            ->assertSessionHasErrors(['amount', 'purpose']);
    }

    public function test_employee_cannot_view_another_users_request(): void
    {
        $request = PaymentRequest::factory()->create();

        $this->actingAs(User::factory()->employee()->create())
            ->get(route('payment-requests.show', $request))
            ->assertForbidden();
    }

    public function test_show_exposes_flattened_requester_and_reviewer(): void
    {
        $finance = User::factory()->finance()->create();
        $request = PaymentRequest::factory()->approved($finance)->create();

        $this->actingAs($finance)
            ->get(route('payment-requests.show', $request))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('PaymentRequests/Show')
                ->where('paymentRequest.requester.name', $request->requester->name)
                ->where('paymentRequest.reviewer.name', $finance->name)
                ->where('can.review', false)
            );
    }

    public function test_finance_can_approve_a_pending_request(): void
    {
        $finance = User::factory()->finance()->create();
        $request = PaymentRequest::factory()->create(['status' => PaymentRequestStatus::Pending]);

        $this->actingAs($finance)
            ->post(route('payment-requests.approve', $request))
            ->assertRedirect()
            ->assertSessionHas('success');

        $request->refresh();
        $this->assertSame(PaymentRequestStatus::Approved, $request->status);
        $this->assertSame($finance->id, $request->reviewed_by);
        $this->assertNotNull($request->reviewed_at);
    }

    public function test_employee_cannot_review_requests(): void
    {
        $request = PaymentRequest::factory()->create(['status' => PaymentRequestStatus::Pending]);

        $this->actingAs(User::factory()->employee()->create())
            ->post(route('payment-requests.reject', $request))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame(PaymentRequestStatus::Pending, $request->fresh()->status);
    }

    public function test_non_pending_requests_cannot_be_reviewed(): void
    {
        $finance = User::factory()->finance()->create();
        $request = PaymentRequest::factory()->create(['status' => PaymentRequestStatus::Approved]);

        $this->actingAs($finance)
            ->post(route('payment-requests.approve', $request))
            ->assertSessionHas('error');

        $this->assertSame(PaymentRequestStatus::Approved, $request->fresh()->status);
    }

    private function fakeRate(string $currency, string $rate, string $fetchedAt): void
    {
        $this->mock(ExchangeRateProvider::class, function (MockInterface $mock) use ($currency, $rate, $fetchedAt) {
            $mock->shouldReceive('getEurRate')->once()->with($currency)
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

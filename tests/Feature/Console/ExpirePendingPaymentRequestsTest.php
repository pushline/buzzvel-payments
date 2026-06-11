<?php

namespace Tests\Feature\Console;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Tests\TestCase;

class ExpirePendingPaymentRequestsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_expires_only_pending_requests_older_than_48_hours(): void
    {
        CarbonImmutable::setTestNow('2026-06-11T12:00:00Z');

        $oldPending = PaymentRequest::factory()->create([
            'created_at' => now()->subHours(48)->subSecond(),
        ]);
        $exactlyAtBoundary = PaymentRequest::factory()->create([
            'created_at' => now()->subHours(48),
        ]);
        $recentPending = PaymentRequest::factory()->create([
            'created_at' => now()->subHours(47),
        ]);
        $approved = PaymentRequest::factory()->approved()->create([
            'created_at' => now()->subDays(3),
        ]);
        $rejected = PaymentRequest::factory()->rejected()->create([
            'created_at' => now()->subDays(3),
        ]);
        $expired = PaymentRequest::factory()->expired()->create([
            'created_at' => now()->subDays(3),
        ]);

        $this->artisan('payments:expire-pending')
            ->expectsOutput('Expired 1 pending payment request(s).')
            ->assertSuccessful();

        $this->assertSame(PaymentRequestStatus::Expired, $oldPending->refresh()->status);
        $this->assertSame(PaymentRequestStatus::Pending, $exactlyAtBoundary->refresh()->status);
        $this->assertSame(PaymentRequestStatus::Pending, $recentPending->refresh()->status);
        $this->assertSame(PaymentRequestStatus::Approved, $approved->refresh()->status);
        $this->assertSame(PaymentRequestStatus::Rejected, $rejected->refresh()->status);
        $this->assertSame(PaymentRequestStatus::Expired, $expired->refresh()->status);
    }

    public function test_it_is_idempotent(): void
    {
        CarbonImmutable::setTestNow('2026-06-11T12:00:00Z');
        $paymentRequest = PaymentRequest::factory()->create([
            'created_at' => now()->subDays(3),
        ]);

        $this->artisan('payments:expire-pending')
            ->expectsOutput('Expired 1 pending payment request(s).')
            ->assertSuccessful();

        $firstUpdatedAt = $paymentRequest->refresh()->updated_at;

        CarbonImmutable::setTestNow(now()->addHour());

        $this->artisan('payments:expire-pending')
            ->expectsOutput('Expired 0 pending payment request(s).')
            ->assertSuccessful();

        $this->assertSame(
            $firstUpdatedAt->toIso8601String(),
            $paymentRequest->refresh()->updated_at->toIso8601String(),
        );
    }

    public function test_it_processes_more_than_one_chunk(): void
    {
        CarbonImmutable::setTestNow('2026-06-11T12:00:00Z');
        PaymentRequest::factory()->count(501)->create([
            'created_at' => now()->subDays(3),
        ]);

        $this->artisan('payments:expire-pending')
            ->expectsOutput('Expired 501 pending payment request(s).')
            ->assertSuccessful();

        $this->assertDatabaseCount('payment_requests', 501);
        $this->assertSame(
            501,
            PaymentRequest::query()->where('status', PaymentRequestStatus::Expired->value)->count(),
        );
    }

    public function test_it_is_scheduled_hourly_without_overlapping(): void
    {
        Artisan::call('schedule:list');
        $events = collect(Schedule::events());
        $event = $events->first(fn ($event) => str_contains($event->command, 'payments:expire-pending'));

        $this->assertNotNull($event);
        $this->assertSame('0 * * * *', $event->expression);
        $this->assertTrue($event->withoutOverlapping);
    }
}

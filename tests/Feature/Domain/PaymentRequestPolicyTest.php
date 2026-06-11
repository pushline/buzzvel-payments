<?php

namespace Tests\Feature\Domain;

use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class PaymentRequestPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_employees_can_view_and_create_their_own_requests_only(): void
    {
        $employee = User::factory()->employee()->create();
        $otherEmployee = User::factory()->employee()->create();
        $ownRequest = PaymentRequest::factory()->for($employee, 'requester')->create();
        $otherRequest = PaymentRequest::factory()->for($otherEmployee, 'requester')->create();

        $gate = Gate::forUser($employee);

        $this->assertTrue($gate->allows('viewAny', PaymentRequest::class));
        $this->assertTrue($gate->allows('create', PaymentRequest::class));
        $this->assertTrue($gate->allows('view', $ownRequest));
        $this->assertFalse($gate->allows('view', $otherRequest));
        $this->assertFalse($gate->allows('review', $ownRequest));
    }

    public function test_finance_can_view_all_requests_and_review_pending_requests(): void
    {
        $finance = User::factory()->finance()->create();
        $pendingRequest = PaymentRequest::factory()->create();
        $approvedRequest = PaymentRequest::factory()->approved($finance)->create();

        $gate = Gate::forUser($finance);

        $this->assertTrue($gate->allows('viewAny', PaymentRequest::class));
        $this->assertFalse($gate->allows('create', PaymentRequest::class));
        $this->assertTrue($gate->allows('view', $pendingRequest));
        $this->assertTrue($gate->allows('view', $approvedRequest));
        $this->assertTrue($gate->allows('review', $pendingRequest));
        $this->assertFalse($gate->allows('review', $approvedRequest));
    }
}

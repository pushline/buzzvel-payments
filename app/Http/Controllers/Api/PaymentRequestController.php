<?php

namespace App\Http\Controllers\Api;

use App\Actions\PaymentRequests\CreatePaymentRequest;
use App\Actions\PaymentRequests\ReviewPaymentRequest;
use App\Enums\PaymentRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\IndexPaymentRequest;
use App\Http\Requests\Api\StorePaymentRequest;
use App\Http\Resources\PaymentRequestResource;
use App\Models\PaymentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PaymentRequestController extends Controller
{
    public function index(IndexPaymentRequest $request): AnonymousResourceCollection
    {
        $query = PaymentRequest::query()
            ->with(['requester', 'reviewer'])
            ->latest();

        if ($request->user()->isEmployee()) {
            $query->whereBelongsTo($request->user(), 'requester');
        }

        $query->when(
            $request->validated('status'),
            fn ($query, $status) => $query->where('status', $status),
        );

        return PaymentRequestResource::collection($query->get());
    }

    public function store(StorePaymentRequest $request, CreatePaymentRequest $create): JsonResponse
    {
        $paymentRequest = $create->handle(
            requester: $request->user(),
            amount: (string) $request->validated('amount'),
            purpose: $request->validated('purpose'),
        );

        return (new PaymentRequestResource($paymentRequest->load(['requester', 'reviewer'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, PaymentRequest $paymentRequest): PaymentRequestResource
    {
        Gate::authorize('view', $paymentRequest);

        return new PaymentRequestResource($paymentRequest->load(['requester', 'reviewer']));
    }

    public function approve(Request $request, PaymentRequest $paymentRequest, ReviewPaymentRequest $review): PaymentRequestResource
    {
        return $this->review($request, $paymentRequest, $review, PaymentRequestStatus::Approved);
    }

    public function reject(Request $request, PaymentRequest $paymentRequest, ReviewPaymentRequest $review): PaymentRequestResource
    {
        return $this->review($request, $paymentRequest, $review, PaymentRequestStatus::Rejected);
    }

    private function review(
        Request $request,
        PaymentRequest $paymentRequest,
        ReviewPaymentRequest $review,
        PaymentRequestStatus $status,
    ): PaymentRequestResource {
        Gate::authorize('review', $paymentRequest);

        return new PaymentRequestResource(
            $review->handle($paymentRequest, $request->user(), $status)->load(['requester', 'reviewer']),
        );
    }
}

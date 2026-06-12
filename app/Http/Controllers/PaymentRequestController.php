<?php

namespace App\Http\Controllers;

use App\Actions\PaymentRequests\CreatePaymentRequest;
use App\Actions\PaymentRequests\ReviewPaymentRequest;
use App\Enums\PaymentRequestStatus;
use App\Exceptions\ExchangeRateUnavailable;
use App\Http\Requests\Api\StorePaymentRequest;
use App\Http\Resources\PaymentRequestResource;
use App\Models\PaymentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PaymentRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $base = PaymentRequest::query()
            ->when($user->isEmployee(), fn ($query) => $query->whereBelongsTo($user, 'requester'));

        $status = $request->query('status');

        if (! in_array($status, array_column(PaymentRequestStatus::cases(), 'value'), true)) {
            $status = null;
        }

        $requests = (clone $base)
            ->with(['requester', 'reviewer'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->get();

        $counts = (clone $base)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $summary = collect(PaymentRequestStatus::cases())
            ->mapWithKeys(fn (PaymentRequestStatus $case) => [$case->value => (int) $counts->get($case->value, 0)])
            ->put('total', (int) $counts->sum())
            ->all();

        return Inertia::render('PaymentRequests/Index', [
            'paymentRequests' => $this->toData(PaymentRequestResource::collection($requests)),
            'summary' => $summary,
            'filters' => ['status' => $status],
            'can' => [
                'create' => $user->can('create', PaymentRequest::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', PaymentRequest::class);

        return Inertia::render('PaymentRequests/Create', [
            'currency' => $request->user()->currency_code,
        ]);
    }

    public function store(StorePaymentRequest $request, CreatePaymentRequest $create): RedirectResponse
    {
        try {
            $paymentRequest = $create->handle(
                requester: $request->user(),
                amount: (string) $request->validated('amount'),
                purpose: $request->validated('purpose'),
            );
        } catch (ExchangeRateUnavailable $exception) {
            return back()
                ->withInput()
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('payment-requests.show', $paymentRequest)
            ->with('success', 'Payment request submitted.');
    }

    public function show(Request $request, PaymentRequest $paymentRequest): Response
    {
        Gate::authorize('view', $paymentRequest);

        return Inertia::render('PaymentRequests/Show', [
            'paymentRequest' => $this->toData(new PaymentRequestResource($paymentRequest->load(['requester', 'reviewer']))),
            'can' => [
                'review' => $request->user()->can('review', $paymentRequest),
            ],
        ]);
    }

    public function approve(Request $request, PaymentRequest $paymentRequest, ReviewPaymentRequest $review): RedirectResponse
    {
        return $this->review($request, $paymentRequest, $review, PaymentRequestStatus::Approved);
    }

    public function reject(Request $request, PaymentRequest $paymentRequest, ReviewPaymentRequest $review): RedirectResponse
    {
        return $this->review($request, $paymentRequest, $review, PaymentRequestStatus::Rejected);
    }

    private function review(
        Request $request,
        PaymentRequest $paymentRequest,
        ReviewPaymentRequest $review,
        PaymentRequestStatus $status,
    ): RedirectResponse {
        if ($request->user()->cannot('review', $paymentRequest)) {
            return back()->with('error', 'This payment request can no longer be reviewed.');
        }

        $review->handle($paymentRequest, $request->user(), $status);

        return back()->with('success', "Payment request {$status->value}.");
    }

    /**
     * Fully resolve a resource to a plain array so Inertia does not re-wrap
     * nested resources (e.g. the requester) in a "data" key.
     *
     * @return array<mixed>
     */
    private function toData(JsonResource $resource): array
    {
        return json_decode($resource->toJson(), true);
    }
}

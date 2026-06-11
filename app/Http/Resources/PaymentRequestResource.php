<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'requester' => new UserResource($this->whenLoaded('requester')),
            'local_amount' => $this->local_amount,
            'local_currency' => $this->local_currency,
            'purpose' => $this->purpose,
            'eur_amount' => $this->eur_amount,
            'exchange_rate' => [
                'rate' => $this->exchange_rate,
                'base_currency' => 'EUR',
                'target_currency' => $this->local_currency,
                'source' => $this->rate_source,
                'fetched_at' => $this->rate_fetched_at->toIso8601String(),
            ],
            'status' => $this->status->value,
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}

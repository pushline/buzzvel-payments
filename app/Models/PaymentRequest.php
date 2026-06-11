<?php

namespace App\Models;

use App\Enums\PaymentRequestStatus;
use Database\Factories\PaymentRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRequest extends Model
{
    /** @use HasFactory<PaymentRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'purpose',
    ];

    protected function casts(): array
    {
        return [
            'local_amount' => 'decimal:4',
            'exchange_rate' => 'decimal:10',
            'eur_amount' => 'decimal:4',
            'rate_fetched_at' => 'immutable_datetime',
            'status' => PaymentRequestStatus::class,
            'reviewed_at' => 'immutable_datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

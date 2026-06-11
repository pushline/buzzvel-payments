<?php

namespace App\Http\Requests\Api;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', PaymentRequest::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::enum(PaymentRequestStatus::class)],
        ];
    }
}

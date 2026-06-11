<?php

namespace App\Http\Requests\Api;

use App\Models\PaymentRequest;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', PaymentRequest::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'decimal:0,4', 'gt:0', 'max:99999999999999.9999'],
            'purpose' => ['required', 'string', 'max:2000'],
        ];
    }
}

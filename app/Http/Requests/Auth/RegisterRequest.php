<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => mb_strtolower((string) $this->input('email')),
            'country_code' => mb_strtoupper((string) $this->input('country_code')),
            'currency_code' => mb_strtoupper((string) $this->input('currency_code')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'country_code' => ['required', 'string', 'size:2', 'alpha:ascii'],
            'currency_code' => ['required', 'string', Rule::in(config('payments.supported_currencies'))],
            'role' => ['prohibited'],
        ];
    }
}

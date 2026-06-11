<?php

namespace App\Actions\Auth;

use App\Enums\UserRole;
use App\Models\User;

class RegisterUser
{
    /**
     * @param  array{name: string, email: string, password: string, country_code: string, currency_code: string}  $data
     */
    public function handle(array $data): User
    {
        return User::forceCreate([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'country_code' => $data['country_code'],
            'currency_code' => $data['currency_code'],
            'role' => UserRole::Employee,
        ]);
    }
}

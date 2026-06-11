<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'country_code' => 'PT',
            'currency_code' => 'EUR',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => UserRole::Employee->value,
            'country_code' => 'PT',
            'currency_code' => 'EUR',
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_web_registration_cannot_assign_the_finance_role(): void
    {
        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'country_code' => 'PT',
            'currency_code' => 'EUR',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => UserRole::Finance->value,
        ])->assertSessionHasErrors('role');

        $this->assertGuest();
        $this->assertDatabaseMissing('users', [
            'email' => 'test@example.com',
        ]);
    }
}

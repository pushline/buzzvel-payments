<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_register_and_receive_an_access_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ana Silva',
            'email' => 'ANA@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'country_code' => 'pt',
            'currency_code' => 'eur',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'ana@example.com')
            ->assertJsonPath('data.role', UserRole::Employee->value)
            ->assertJsonPath('data.country_code', 'PT')
            ->assertJsonPath('data.currency_code', 'EUR')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('users', [
            'email' => 'ana@example.com',
            'role' => UserRole::Employee->value,
            'country_code' => 'PT',
            'currency_code' => 'EUR',
        ]);
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_registration_rejects_invalid_data_duplicate_email_and_finance_role(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'existing@example.com',
            'password' => 'short',
            'password_confirmation' => 'different',
            'country_code' => 'Portugal',
            'currency_code' => 'INVALID',
            'role' => UserRole::Finance->value,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'email',
                'password',
                'country_code',
                'currency_code',
                'role',
            ]);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->finance()->create([
            'email' => 'finance@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'FINANCE@example.com',
            'password' => 'password',
            'device_name' => 'reviewer-laptop',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', UserRole::Finance->value)
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'reviewer-laptop',
        ]);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'employee@example.com',
            'password' => 'password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'employee@example.com',
            'password' => 'wrong-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email')
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonPath('error.status', 422);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_authenticated_user_can_be_retrieved_and_active_token_can_be_revoked(): void
    {
        $user = User::factory()->employee()->create();
        $otherToken = $user->createToken('other-device');
        $activeToken = $user->createToken('active-device');

        $headers = ['Authorization' => 'Bearer '.$activeToken->plainTextToken];

        $this->withHeaders($headers)
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonMissingPath('data.password');

        $this->withHeaders($headers)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);

        $this->app['auth']->forgetGuards();

        $this->withHeaders($headers)
            ->getJson('/api/auth/user')
            ->assertUnauthorized();

        $this->assertNotNull(PersonalAccessToken::findToken($otherToken->plainTextToken));
        $this->assertNull(PersonalAccessToken::findToken($activeToken->plainTextToken));
    }

    public function test_password_is_hashed_after_registration(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Employee',
            'email' => 'employee@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'country_code' => 'BR',
            'currency_code' => 'BRL',
        ])->assertCreated();

        $user = User::where('email', 'employee@example.com')->firstOrFail();

        $this->assertTrue(Hash::check('password', $user->password));
        $this->assertNotSame('password', $user->password);
    }
}

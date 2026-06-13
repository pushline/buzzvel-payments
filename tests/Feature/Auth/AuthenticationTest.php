<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\SessionGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_request_a_persistent_login(): void
    {
        $user = User::factory()->create(['remember_token' => null]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'remember' => true,
        ]);

        $guard = Auth::guard('web');

        $this->assertInstanceOf(SessionGuard::class, $guard);
        $response->assertCookie($guard->getRecallerName());
        $this->assertNotNull($user->fresh()->remember_token);
    }

    public function test_normal_login_does_not_create_a_persistent_login(): void
    {
        $user = User::factory()->create(['remember_token' => null]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'remember' => false,
        ]);

        $guard = Auth::guard('web');

        $this->assertInstanceOf(SessionGuard::class, $guard);
        $response->assertCookieMissing($guard->getRecallerName());
        $this->assertNull($user->fresh()->remember_token);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}

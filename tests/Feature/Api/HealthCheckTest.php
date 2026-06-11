<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_api_health_check_returns_json(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson(['status' => 'ok']);
    }

    public function test_protected_api_routes_return_json_errors(): void
    {
        $this->getJson('/api/auth/user')
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'status' => 401,
                ],
            ]);
    }

    public function test_api_errors_are_json_even_without_an_accept_header(): void
    {
        $this->get('/api/auth/user')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }
}

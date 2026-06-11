<?php

namespace App\Support;

use App\Exceptions\ExchangeRateUnavailable;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ApiErrorResponse
{
    public static function from(Response $response, Throwable $exception): JsonResponse
    {
        $status = $response->getStatusCode();
        $payload = json_decode((string) $response->getContent(), true);

        $body = [
            'message' => is_array($payload) && isset($payload['message'])
                ? $payload['message']
                : (Response::$statusTexts[$status] ?? 'Request failed.'),
            'error' => [
                'code' => self::code($status, $exception),
                'status' => $status,
            ],
        ];

        if (is_array($payload) && isset($payload['errors'])) {
            $body['errors'] = $payload['errors'];
        }

        return response()->json($body, $status);
    }

    private static function code(int $status, Throwable $exception): string
    {
        if ($exception instanceof ExchangeRateUnavailable) {
            return 'EXCHANGE_RATE_UNAVAILABLE';
        }

        return match ($status) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHENTICATED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            419 => 'SESSION_EXPIRED',
            422 => 'VALIDATION_ERROR',
            429 => 'TOO_MANY_REQUESTS',
            500 => 'SERVER_ERROR',
            503 => 'SERVICE_UNAVAILABLE',
            default => 'HTTP_ERROR',
        };
    }
}

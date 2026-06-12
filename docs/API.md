# BuzzPay API Reference

Base URL: `http://127.0.0.1:8000/api`

Send `Accept: application/json` with every request. Protected endpoints also
require `Authorization: Bearer <token>`.

## Common Resources

User:

```json
{
  "id": 1,
  "name": "Ana Silva",
  "email": "ana@example.com",
  "role": "employee",
  "country_code": "BR",
  "currency_code": "BRL"
}
```

Payment request:

```json
{
  "data": {
    "id": 1,
    "requester": {
      "id": 1,
      "name": "Ana Silva",
      "email": "ana@example.com",
      "role": "employee",
      "country_code": "BR",
      "currency_code": "BRL"
    },
    "local_amount": "120.5000",
    "local_currency": "BRL",
    "purpose": "Conference travel",
    "eur_amount": "20.1549",
    "exchange_rate": {
      "rate": "5.9787000000",
      "base_currency": "EUR",
      "target_currency": "BRL",
      "source": "ExchangeRate-API",
      "fetched_at": "2026-06-11T00:00:01+00:00"
    },
    "status": "pending",
    "reviewer": null,
    "reviewed_at": null,
    "created_at": "2026-06-11T23:35:33+00:00",
    "updated_at": "2026-06-11T23:35:33+00:00"
  }
}
```

## Error Format

```json
{
  "message": "The given data was invalid.",
  "error": {
    "code": "VALIDATION_ERROR",
    "status": 422
  },
  "errors": {
    "amount": ["The amount field must be greater than 0."]
  }
}
```

Common statuses are `401` unauthenticated, `403` forbidden, `404` not found,
`405` method not allowed, `422` validation error, and `503` exchange-rate
provider unavailable.

## Health

### `GET /health`

Authentication: none.

Response `200`:

```json
{ "status": "ok" }
```

## Authentication

### `POST /auth/register`

Authentication: none. Public registration always assigns the `employee` role.

Body:

| Field | Rules |
| --- | --- |
| `name` | Required string, maximum 255 characters. |
| `email` | Required unique email, maximum 255 characters. |
| `password` | Required, confirmed; send `password_confirmation`. |
| `country_code` | Required two-letter ASCII country code. |
| `currency_code` | Required configured supported currency. |
| `role` | Prohibited. |

Example:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "password",
  "password_confirmation": "password",
  "country_code": "BR",
  "currency_code": "BRL"
}
```

Response `201`:

```json
{
  "data": { "...": "user resource" },
  "token": "1|plain-text-token",
  "token_type": "Bearer"
}
```

Errors: `422` for invalid/duplicate data or attempted role assignment.

### `POST /auth/login`

Authentication: none.

Body:

```json
{
  "email": "ana@example.com",
  "password": "password",
  "device_name": "developer-laptop"
}
```

`device_name` is optional and defaults to `api`.

Response `200`:

```json
{
  "data": { "...": "user resource" },
  "token": "2|plain-text-token",
  "token_type": "Bearer"
}
```

Errors: `422` for invalid credentials or input.

### `GET /auth/user`

Authentication: Bearer token.

Response `200`:

```json
{
  "data": { "...": "current user resource" }
}
```

Errors: `401` without a valid active token.

### `POST /auth/logout`

Authentication: Bearer token. Revokes only the active token.

Response `200`:

```json
{ "message": "Logged out successfully." }
```

Errors: `401` without a valid active token.

## Payment Requests

### `GET /payment-requests`

Authentication: Bearer token.

Employees receive only their requests. Finance users receive all requests.

Query parameters:

| Parameter | Values |
| --- | --- |
| `status` | Optional: `pending`, `approved`, `rejected`, or `expired`. |

Response `200`:

```json
{
  "data": [
    { "...": "payment request resource" }
  ]
}
```

Errors: `401` unauthenticated; `422` invalid status.

### `POST /payment-requests`

Authentication: employee Bearer token.

Only `amount` and `purpose` are accepted. Requester, local currency, rate
metadata, EUR amount, and initial status are derived by the server.

Body:

| Field | Rules |
| --- | --- |
| `amount` | Required positive decimal, maximum four decimal places. |
| `purpose` | Required string, maximum 2,000 characters. |

Example:

```json
{
  "amount": "120.5000",
  "purpose": "Conference travel"
}
```

Response `201`: payment request resource.

Errors: `401` unauthenticated; `403` finance user; `422` invalid input; `503`
provider unavailable. Provider/persistence failures create no partial record.

### `GET /payment-requests/{id}`

Authentication: Bearer token.

Employees may access only their own request. Finance users may access any
request.

Response `200`: payment request resource.

Errors: `401`, `403`, or `404`.

### `POST /payment-requests/{id}/approve`

Authentication: finance Bearer token. Body: none.

Approves a pending request, records the reviewer and review timestamp, and
preserves every monetary/rate field.

Response `200`: updated payment request resource.

Errors: `401`, `403` for non-finance or non-pending request, or `404`.

### `POST /payment-requests/{id}/reject`

Authentication: finance Bearer token. Body: none.

Rejects a pending request, records the reviewer and review timestamp, and
preserves every monetary/rate field.

Response `200`: updated payment request resource.

Errors: `401`, `403` for non-finance or non-pending request, or `404`.

## PowerShell Example

```powershell
$session = Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/api/auth/login `
  -ContentType "application/json" `
  -Headers @{ Accept = "application/json" } `
  -Body '{"email":"ana@example.com","password":"password"}'

$token = $session.token

Invoke-RestMethod `
  -Uri http://127.0.0.1:8000/api/payment-requests `
  -Headers @{ Authorization = "Bearer $token"; Accept = "application/json" }
```

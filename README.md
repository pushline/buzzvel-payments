# BuzzPay

BuzzPay is a Laravel 12 application for managing multi-currency payment
requests. Employees submit requests in their assigned local currency. BuzzPay
fetches and permanently stores the EUR conversion rate, while finance users
review every request from a shared queue.

The repository includes a REST API authenticated with Laravel Sanctum and a
responsive React/Inertia demonstration interface.

## Features

- Employee registration, login, logout, and Sanctum API tokens.
- Employee and finance roles with policy-based authorization.
- Multi-currency requests converted from local currency to EUR.
- Immutable exchange-rate value, source, and provider timestamp.
- Finance-only approval and rejection of pending requests.
- Status filtering for `pending`, `approved`, `rejected`, and `expired`.
- Hourly expiration of requests pending for more than 48 hours.
- Repeatable international demo data.
- Consistent JSON errors and extensive automated coverage.

## Requirements

- PHP 8.2 or newer with `bcmath`, `pdo_sqlite`, and `sqlite3`.
- Composer.
- Node.js and npm.
- An [ExchangeRate-API](https://www.exchangerate-api.com/) API key for creating
  requests against the live provider.

## Setup

```powershell
git clone <repository-url>
cd buzzvel-laravel
composer install
npm install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
npm run build
```

Add a provider key to `.env`:

```dotenv
EXCHANGE_RATE_API_KEY=your-key-here
```

Start the application:

```powershell
composer run dev
```

Then open `http://127.0.0.1:8000`.

The Composer development command starts the Laravel server, queue listener, and
Vite server. It intentionally does not start Laravel Pail because Pail requires
the unavailable Windows `pcntl` extension.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_URL` | `http://localhost` | Public application URL. |
| `DB_CONNECTION` | `sqlite` | Database connection. |
| `QUEUE_CONNECTION` | `database` | Queue backend used by the development command. |
| `EXCHANGE_RATE_API_BASE_URL` | `https://v6.exchangerate-api.com` | Provider base URL. |
| `EXCHANGE_RATE_API_KEY` | empty | Required for live payment-request creation. |
| `EXCHANGE_RATE_API_TIMEOUT` | `10` | Provider request timeout in seconds. |
| `EXCHANGE_RATE_API_SOURCE` | `ExchangeRate-API` | Source label stored with requests. |

Never commit `.env` or provider credentials. Automated tests fake the exchange
rate provider and do not require an API key.

## Demo Accounts

Run `php artisan db:seed` at any time to refresh the deterministic demo records.
The seeder is idempotent and preserves unrelated local records.

All demo users use the password `password`.

| Role | Email | Country | Currency |
| --- | --- | --- | --- |
| Finance | `finance@example.com` | Portugal | EUR |
| Employee | `ana@example.com` | Brazil | BRL |
| Employee | `james@example.com` | United Kingdom | GBP |
| Employee | `sofia@example.com` | Mexico | MXN |
| Employee | `haruto@example.com` | Japan | JPY |
| Employee | `priya@example.com` | India | INR |

The seeded requests cover every payment status.

## Scheduler

BuzzPay schedules `payments:expire-pending` hourly without overlapping. It
expires only pending requests created more than 48 hours ago.

Run the command manually:

```powershell
php artisan payments:expire-pending
```

Run the scheduler locally:

```powershell
php artisan schedule:work
```

Production should invoke Laravel's scheduler every minute:

```cron
* * * * * cd /path/to/buzzpay && php artisan schedule:run >> /dev/null 2>&1
```

## Verification

```powershell
php artisan migrate:fresh --seed
php artisan test
vendor/bin/pint --test
npm run build
composer audit --no-interaction
npm audit --audit-level=high
php artisan route:list --path=api
php artisan schedule:list
```

Generate favicons after changing `public/favicon.svg`:

```powershell
npm run favicons
```

No frontend linter or PHP static analyzer is configured. PHPUnit, Pint,
dependency audits, and the production frontend build are the configured quality
checks.

## Architecture

- **Authentication:** Sanctum personal access tokens protect the API; the
  Inertia demonstration UI uses Laravel's web session authentication.
- **Domain rules:** enums define roles and payment statuses, policies control
  visibility/review permissions, and actions own creation/review transactions.
- **Exchange rates:** application code depends on `ExchangeRateProvider`.
  `ExchangeRateApiProvider` is the production adapter and tests replace it with
  fakes.
- **Money precision:** local and EUR amounts use `DECIMAL(18,4)`, rates use
  `DECIMAL(20,10)`, and conversion uses BCMath rather than floating point.
- **Conversion:** EUR amount equals `local_amount / EUR_to_local_rate`, rounded
  half-up to four decimal places.
- **Immutability:** request creation accepts only `amount` and `purpose`.
  Currency, conversion, and provider metadata are derived server-side, and no
  general update/delete API exists.
- **Review concurrency:** finance review locks the request row inside a
  transaction and allows transitions only from `pending`.
- **Expiration:** an idempotent chunked command expires eligible pending
  requests.

## Authorization

- Public registration always creates an employee.
- Employees create requests and access only their own requests.
- Finance users are created through seeders and access all requests.
- Only finance users can approve or reject pending requests.

## API Documentation

See [docs/API.md](docs/API.md) for every endpoint, parameters, examples, and
error responses.

All protected requests require:

```http
Authorization: Bearer <token>
Accept: application/json
```

See [docs/QUALITY_REVIEW.md](docs/QUALITY_REVIEW.md) for the final
requirement-to-test matrix and manual review checklist.

## Known Limitations

- The API list endpoint returns all visible requests and is not paginated.
- Supported registration currencies come from `config/payments.php`.
- Finance accounts are intentionally not created through public registration.
- A hosted URL or recorded video must be produced outside this repository.

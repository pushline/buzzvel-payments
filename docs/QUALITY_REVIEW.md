# Final Quality Review

## Requirement Coverage

| Requirement | Primary automated coverage |
| --- | --- |
| API registration, login, logout, current user | `tests/Feature/Api/AuthenticationTest.php` |
| Public registration always creates employees | API and web authentication tests |
| Input validation and meaningful JSON errors | API authentication, health, and payment request tests |
| Employee/finance authorization boundaries | Payment request API, web, and policy tests |
| Create/list/view/filter payment requests | Payment request API and web tests |
| Finance approve/reject pending requests only | Payment request API, web, and policy tests |
| Immutable rate and monetary metadata | Payment request API and model tests |
| EUR conversion and rounding | `tests/Unit/ExchangeRates/EurAmountConverterTest.php` |
| Provider success, invalid response, and failure | `tests/Feature/ExchangeRates/ExchangeRateApiProviderTest.php` |
| No partial record on provider/persistence failure | Payment request API tests |
| Automatic expiration, boundary, chunking, idempotency | `tests/Feature/Console/ExpirePendingPaymentRequestsTest.php` |
| International demo users and representative requests | `tests/Feature/Database/DatabaseSeederTest.php` |
| Employee and finance Inertia workflows | `tests/Feature/Web/PaymentRequestPageTest.php` |

All tests inherit `Http::preventStrayRequests()`, so an accidental live external
HTTP request fails the suite.

## Configured Quality Checks

```powershell
php artisan test
vendor/bin/pint --test
npm run build
composer validate --strict --no-check-publish
composer audit --no-interaction
npm audit --audit-level=high
git diff --check
```

No frontend lint command or PHP static analyzer is configured in this project.

## Manual Review Still Required

Automated coverage verifies the employee and finance workflows, but a human
should complete the browser smoke test and visual review before submission:

1. Run `php artisan migrate:fresh --seed` and `composer run dev`.
2. Complete an employee workflow using `ana@example.com`.
3. Complete a finance workflow using `finance@example.com`.
4. Review mobile and desktop layouts.
5. Record or host the required demonstration.

Use `password` for both demo accounts.

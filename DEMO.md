# Demo Accounts

These accounts are created by `php artisan migrate:fresh --seed` or refreshed
with the idempotent `php artisan db:seed` command.
All demo accounts use the password `password`.

## Finance

- Email: `finance@example.com`
- Role: finance
- Country/currency: Portugal (`EUR`)

## Employees

| Email | Country | Currency |
| --- | --- | --- |
| `ana@example.com` | Brazil | BRL |
| `james@example.com` | United Kingdom | GBP |
| `sofia@example.com` | Mexico | MXN |
| `haruto@example.com` | Japan | JPY |
| `priya@example.com` | India | INR |

The seeded payment requests include pending, approved, rejected, and expired
examples with deterministic exchange-rate metadata.

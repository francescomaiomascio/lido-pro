# Tariff Catalog Model

## Boundary

Tariffs are configurable local data.

They are not hardcoded business logic and they do not directly change the map.

## Tariff Rule

A tariff rule matches:

- item type
- optional row label
- reservation type
- optional validity period

The result is an amount in integer cents.

## Price Suggestion

Price suggestions help prefill account totals.

The operator can override the total before saving.

Existing account totals are not overwritten silently.

## Future Boundary

Wave 8 can add extra items such as lettini, sdraio, and sedie.

Wave 9 can combine tariff + period + extras into stronger account automation.

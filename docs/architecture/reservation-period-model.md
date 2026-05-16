# Reservation Period Model

## Boundary

A reservation is a period claim over one beach item.

It links:

- beach item
- customer
- optional customer assignment
- optional account

## Not Payment

Reservations do not own payments. Payments remain attached to accounts.

## Not Invoice

Reservations are not invoices, receipts, or fiscal documents.

## Account Link

A reservation can reference an account so the operator can see the operational period and the money state together.

Wave 6 does not update account totals or create payments automatically.

## Future Work

Future waves can add:

- calendar view
- tariff catalog
- price suggestions from tariff + period
- extra items such as lettini, sdraio, and sedie

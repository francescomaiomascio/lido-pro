# Account / Payment Model

## Boundary

An account is a local operational record for a customer assigned to a beach item.

It is not:

- an invoice
- a fiscal receipt
- an online payment session
- a booking calendar entry

## Account

The account stores expected amount, paid amount, balance, status, and notes.

It references:

- beach item
- customer
- optional customer assignment

## Payment

Payments are local records attached to an account.

Payments are append-only for now. Wave 5 does not delete or edit payments.

Allowed methods:

- cash
- card
- transfer
- other

## Money

All money is stored as integer cents to avoid floating point errors.

Display formatting converts cents to Euro only at the UI boundary.

## Future Work

Future waves can add:

- exports/backups
- invoice or fiscal receipt model
- online payment integration
- reservation periods

Those should build on top of accounts and payments without changing the original metric beach layout.

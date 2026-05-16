# Customer Assignment Model

## Boundary

Wave 4 separates customers from beach places through an assignment table.

Customer data describes the person:

- name
- phone
- email
- notes

Assignment data describes the relationship between one customer and one beach item:

- item
- customer
- daily or seasonal type
- assigned date
- unassigned date
- assignment note

## Why Assignment Is Separate

A customer can exist without being assigned to a place. A place can change customer over time. Keeping assignments separate preserves history and avoids overwriting customer records when daily operations change.

## Not An Account

The assignment is not a payment, invoice, balance, or account. It only says who is currently linked to a place.

Accounts and payments should attach later to the customer-place relationship without changing the core customer table.

## Not A Reservation Calendar

This model does not manage date ranges or booking periods yet. `daily` and `seasonal` are operational labels, not full reservations.

Future reservation work can add date-based records without replacing active assignment history.

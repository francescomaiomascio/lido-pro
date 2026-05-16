# Extra Items Account Model

Extra items are separate from the beach layout. They do not change the map, item coordinates, or seed layout.

## Catalog

`extra_item_catalog` stores editable extra article definitions such as:

- Lettino
- Sdraio
- Sedia

Default prices are local data and can be changed later.

## Account Extras

`account_extra_items` stores the extra articles added to a specific account.

Each account extra records:

- name
- quantity
- unit amount in cents
- total amount in cents

## Account Totals

Money is stored in integer cents.

Current rule:

```txt
account total = base amount + active extras total
balance = account total - paid amount
```

Payments are not modified or deleted when extras are added or removed.

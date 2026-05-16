# Bottom Operational Panel Model

The app uses three main work zones:

```txt
Topbar
Workspace
  - map/list
  - overview sidebar
Bottom operational panel
```

The sidebar is intentionally summary-only. It gives the operator fast context without turning into a long form column.

Full workflows belong in the bottom operational panel:

- customer assignment
- reservation period
- tariff suggestion
- account creation/editing
- payments
- extra items
- history
- technical details

The bottom panel is tied to the selected beach item and scrolls internally when its content is longer than the available height.

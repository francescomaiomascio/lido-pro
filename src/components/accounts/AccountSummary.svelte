<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { Account } from '../../lib/types/account'

  let {
    account,
  }: {
    account: Account
  } = $props()
</script>

<dl class="account-summary">
  <div><dt>Tariffa/base</dt><dd>{formatEuroFromCents(account.baseAmountCents)}</dd></div>
  <div><dt>Extra</dt><dd>{formatEuroFromCents(account.extrasAmountCents)}</dd></div>
  <div><dt>Totale</dt><dd>{formatEuroFromCents(account.totalAmountCents)}</dd></div>
  <div><dt>Pagato</dt><dd>{formatEuroFromCents(account.paidAmountCents)}</dd></div>
  <div><dt>Saldo</dt><dd>{formatEuroFromCents(account.balanceAmountCents)}</dd></div>
  <div><dt>Stato conto</dt><dd>{accountStatusLabels[account.status]}</dd></div>
</dl>

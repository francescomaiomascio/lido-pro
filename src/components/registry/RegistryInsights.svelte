<script lang="ts">
  import { businessConfig } from '../../lib/config/appConfig'
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { RegistryRecord, RegistrySummary } from '../../lib/types/registry'

  let {
    records,
    summary,
    year,
  }: {
    records: RegistryRecord[]
    summary: RegistrySummary
    year: number
  } = $props()

  const today = new Date().toISOString().slice(0, 10)
  const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const collectionRate = $derived(
    summary.totalDueCents > 0 ? Math.round((summary.totalPaidCents / summary.totalDueCents) * 100) : 0,
  )
  const paidShare = $derived(
    summary.totalDueCents > 0
      ? Math.min(100, Math.round((summary.totalPaidCents / summary.totalDueCents) * 100))
      : 0,
  )
  const balanceShare = $derived(Math.max(0, 100 - paidShare))
  const openBalanceRecords = $derived(records.filter((record) => record.balanceAmountCents > 0))
  const paidRecords = $derived(records.filter((record) => record.accountStatus === 'paid'))
  const partialRecords = $derived(records.filter((record) => record.accountStatus === 'partial'))
  const openRecords = $derived(records.filter((record) => record.accountStatus === 'open'))
  const overdueRecords = $derived(
    openBalanceRecords.filter((record) => record.endDate !== null && record.endDate < today),
  )
  const nextDueRecords = $derived(
    openBalanceRecords.filter(
      (record) => record.endDate !== null && record.endDate >= today && record.endDate <= inTwoWeeks,
    ),
  )
  const topBalanceRecord = $derived(
    openBalanceRecords.toSorted((a, b) => b.balanceAmountCents - a.balanceAmountCents)[0] ?? null,
  )
  const recoveryQueue = $derived(
    openBalanceRecords.toSorted((a, b) => b.balanceAmountCents - a.balanceAmountCents).slice(0, 3),
  )
  const maxStatusCount = $derived(Math.max(1, openRecords.length, partialRecords.length, paidRecords.length))
  const maxAgingCount = $derived(Math.max(1, overdueRecords.length, nextDueRecords.length, openBalanceRecords.length))
  const averageOpenBalance = $derived(
    openBalanceRecords.length > 0
      ? Math.round(summary.totalBalanceCents / openBalanceRecords.length)
      : 0,
  )
  const portfolioRisk = $derived.by(() => {
    if (summary.totalDueCents === 0) return 'Nessun rischio'
    if (overdueRecords.length > 0 || collectionRate < 45) return 'Rischio alto'
    if (collectionRate < 75 || partialRecords.length > 0) return 'Da monitorare'
    return 'Sotto controllo'
  })
  const monthlyPipeline = $derived.by(() => {
    const formatter = new Intl.DateTimeFormat('it-IT', { month: 'short' })
    const startMonth = businessConfig.season.startMonth
    const endMonth = businessConfig.season.endMonth
    const monthCount = endMonth >= startMonth ? endMonth - startMonth + 1 : 12 - startMonth + endMonth + 1
    const months = Array.from({ length: monthCount }, (_, index) => {
      const monthNumber = ((startMonth - 1 + index) % 12) + 1
      const monthYear = monthNumber >= startMonth ? year : year + 1
      const date = new Date(monthYear, monthNumber - 1, 1)
      return {
        key: `${monthYear}-${String(monthNumber).padStart(2, '0')}`,
        label: formatter.format(date).replace('.', ''),
        paid: 0,
        balance: 0,
      }
    })

    for (const record of records) {
      const key = (record.startDate ?? '').slice(0, 7)
      const bucket = months.find((month) => month.key === key)
      if (!bucket) continue
      bucket.paid += record.paidAmountCents
      bucket.balance += record.balanceAmountCents
    }

    const maxValue = Math.max(1, ...months.map((month) => month.paid + month.balance))
    return months.map((month) => ({
      ...month,
      paidSize: (month.paid / maxValue) * 100,
      balanceSize: (month.balance / maxValue) * 100,
    }))
  })
  const seasonLabel = $derived.by(() => {
    const start = monthlyPipeline[0]?.label ?? 'stagione'
    const end = monthlyPipeline[monthlyPipeline.length - 1]?.label ?? ''
    return `${start} - ${end} ${year}`
  })

  const insights = $derived.by(() => {
    const nextInsights: string[] = []

    if (topBalanceRecord) {
      nextInsights.push(
        `${topBalanceRecord.customerName}: ${formatEuroFromCents(topBalanceRecord.balanceAmountCents)} ancora aperti su ${topBalanceRecord.itemCode}.`,
      )
    }

    if (overdueRecords.length > 0) {
      nextInsights.push(`${overdueRecords.length} saldi risultano oltre la fine periodo: priorita di recupero.`)
    }

    if (collectionRate < 70 && summary.totalDueCents > 0) {
      nextInsights.push(`Incasso al ${collectionRate}%: utile filtrare "Da incassare" e chiudere i parziali.`)
    }

    if (partialRecords.length > openRecords.length && partialRecords.length > 0) {
      nextInsights.push(`${partialRecords.length} conti parziali: controllare acconti e saldo finale.`)
    }

    if (nextInsights.length === 0) {
      nextInsights.push('Situazione ordinata: nessuna criticita evidente nei movimenti filtrati.')
    }

    return nextInsights.slice(0, 3)
  })
</script>

<section class="registry-insights" aria-label="Analisi registro">
  <div class="registry-insights__finance">
    <div
      class="registry-donut"
      style={`--paid-share: ${paidShare}; --balance-share: ${balanceShare};`}
      aria-label={`Incasso ${collectionRate}%`}
    >
      <div>
        <span>Incasso</span>
        <strong>{collectionRate}%</strong>
      </div>
    </div>
    <div class="registry-insights__numbers">
      <div>
        <span>Entrate registrate</span>
        <strong>{formatEuroFromCents(summary.totalPaidCents)}</strong>
      </div>
      <div>
        <span>Da incassare</span>
        <strong>{formatEuroFromCents(summary.totalBalanceCents)}</strong>
      </div>
      <div>
        <span>Movimenti filtrati</span>
        <strong>{records.length}</strong>
      </div>
    </div>
  </div>

  <div class="registry-insights__bars" aria-label="Distribuzione conti">
    <header>
      <strong>Stato conti</strong>
      <span>{summary.openAccounts + summary.partialAccounts + summary.paidAccounts} conti tracciati</span>
    </header>
    <div class="registry-bar-row">
      <span>Aperti</span>
      <i style={`--bar-size: ${(openRecords.length / maxStatusCount) * 100}%`}></i>
      <strong>{openRecords.length}</strong>
    </div>
    <div class="registry-bar-row">
      <span>Parziali</span>
      <i style={`--bar-size: ${(partialRecords.length / maxStatusCount) * 100}%`}></i>
      <strong>{partialRecords.length}</strong>
    </div>
    <div class="registry-bar-row">
      <span>Pagati</span>
      <i style={`--bar-size: ${(paidRecords.length / maxStatusCount) * 100}%`}></i>
      <strong>{paidRecords.length}</strong>
    </div>
  </div>

  <div class="registry-insights__bars registry-insights__bars--aging" aria-label="Aging saldo">
    <header>
      <strong>Aging saldo</strong>
      <span>{openBalanceRecords.length} posizioni aperte</span>
    </header>
    <div class="registry-bar-row">
      <span>Scaduti</span>
      <i style={`--bar-size: ${(overdueRecords.length / maxAgingCount) * 100}%`}></i>
      <strong>{overdueRecords.length}</strong>
    </div>
    <div class="registry-bar-row">
      <span>14 giorni</span>
      <i style={`--bar-size: ${(nextDueRecords.length / maxAgingCount) * 100}%`}></i>
      <strong>{nextDueRecords.length}</strong>
    </div>
    <div class="registry-bar-row">
      <span>Totale aperti</span>
      <i style={`--bar-size: ${(openBalanceRecords.length / maxAgingCount) * 100}%`}></i>
      <strong>{openBalanceRecords.length}</strong>
    </div>
  </div>

  <div class="registry-insights__bars registry-insights__bars--pipeline" aria-label="Pipeline economica">
    <header>
      <strong>Pipeline stagione</strong>
      <span>{seasonLabel} · incassato/residuo</span>
    </header>
    <div class="registry-pipeline" style={`--season-month-count: ${monthlyPipeline.length};`}>
      {#each monthlyPipeline as month}
        <div>
          <i>
            <b style={`--bar-size: ${month.paidSize}%`}></b>
            <em style={`--bar-size: ${month.balanceSize}%`}></em>
          </i>
          <span>{month.label}</span>
          <small>{formatEuroFromCents(month.paid + month.balance)}</small>
        </div>
      {/each}
    </div>
  </div>

  <div class="registry-insights__queue" aria-label="Coda recupero credito">
    <header>
      <strong>Recupero saldi</strong>
      <span>{portfolioRisk} · media {formatEuroFromCents(averageOpenBalance)}</span>
    </header>
    <div class="registry-recovery-list">
      {#each recoveryQueue as record}
        <div>
          <span>{record.customerName}</span>
          <strong>{formatEuroFromCents(record.balanceAmountCents)}</strong>
          <small>{record.itemCode}</small>
        </div>
      {:else}
        <p>Nessun saldo aperto nella vista corrente.</p>
      {/each}
    </div>
  </div>

  <div class="registry-insights__hints" aria-label="Suggerimenti registro">
    <header>
      <strong>Hint operativi</strong>
      <span>In base ai filtri attivi</span>
    </header>
    <ul>
      {#each insights as insight}
        <li>{insight}</li>
      {/each}
    </ul>
  </div>
</section>

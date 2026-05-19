import { getAccount } from '../db/accountRepository'
import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import {
  createPricingSnapshot as persistPricingSnapshot,
  getPricingSnapshotById,
  getPricingSnapshotForReservation as getPersistedPricingSnapshotForReservation,
  listPricingSnapshotsForReservation as listPersistedPricingSnapshotsForReservation,
  linkPricingSnapshotToAccount,
  linkPricingSnapshotToReservation,
  updatePricingSnapshotStatus,
} from '../db/bookingRepository'
import { getExtraItemsForAccount, getIncludedItemsForTariffContext } from '../db/extraItemRepository'
import { getReservation } from '../db/reservationRepository'
import { suggestPriceForItem } from '../db/tariffRepository'
import type { Account } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { AccountExtraItem, TariffIncludedItem } from '../types/extraItem'
import type { Reservation } from '../types/reservation'
import { appendPricingEvent } from '../registry/registryEventService'
import type { PricingSnapshotRecord } from './bookingPersistence.types'
import { normalizeBookingPeriod } from './bookingPeriodService'
import type {
  PricingSnapshot,
  PricingSnapshotInput,
  PricingSnapshotLine,
  PricingSnapshotResult,
  PricingSnapshotStatus,
} from './pricingSnapshot.types'

const dayMs = 86_400_000

const createLineId = (prefix: string, id: string) => `${prefix}-${id}`

const getDayCount = (reservation: Reservation) =>
  Math.max(
    1,
    Math.round(
      (new Date(`${reservation.endDate}T00:00:00`).getTime() -
        new Date(`${reservation.startDate}T00:00:00`).getTime()) /
        dayMs,
    ) + 1,
  )

const loadItem = async (itemId: string): Promise<BeachItem | null> => {
  const layout = await getActiveLayout()
  const items = await getBeachItems(layout.id)
  return items.find((item) => item.id === itemId) ?? null
}

const toSnapshot = (record: PricingSnapshotRecord): PricingSnapshot => ({
  ...record,
  reservationId: record.reservationId ?? '',
  accountId: record.accountId ?? null,
  source: (record.source ?? 'operator_app') as PricingSnapshot['source'],
  status: record.status ?? 'locked',
  discountsTotal: record.discountsTotal ?? 0,
  lines: (record.lines ?? []) as PricingSnapshotLine[],
  scope: record.scope as PricingSnapshot['scope'],
  manualOverride: (record.manualOverride ?? null) as PricingSnapshot['manualOverride'],
})

const buildIncludedLines = (items: TariffIncludedItem[]): PricingSnapshotLine[] =>
  items.map((item) => ({
    id: createLineId('included', item.id),
    type: 'included_item',
    articleId: item.catalogItemId ?? null,
    sourceRuleId: item.tariffRuleId ?? null,
    description: item.name,
    quantity: item.quantity,
    unitPrice: 0,
    totalPrice: 0,
    included: true,
    metadata: {
      reservationType: item.reservationType,
      itemType: item.itemType,
      rowLabel: item.rowLabel ?? null,
    },
  }))

const buildExtraLines = (extras: AccountExtraItem[]): PricingSnapshotLine[] =>
  extras
    .filter((extra) => extra.active)
    .map((extra) => ({
      id: createLineId('extra', extra.id),
      type: 'extra',
      articleId: extra.catalogItemId ?? null,
      description: extra.name,
      quantity: extra.quantity,
      unitPrice: extra.unitAmountCents,
      totalPrice: extra.totalAmountCents,
      included: false,
      metadata: {
        accountExtraItemId: extra.id,
        notes: extra.notes ?? null,
      },
    }))

export const buildPricingSnapshot = async (
  input: PricingSnapshotInput,
): Promise<PricingSnapshotResult> => {
  const reservation = await getReservation(input.reservationId)
  if (!reservation) {
    throw new Error('Prenotazione non trovata.')
  }

  const item = await loadItem(input.itemId ?? reservation.itemId)
  if (!item) {
    throw new Error('Posto non trovato.')
  }

  const account = input.accountId ?? reservation.accountId
    ? await getAccount((input.accountId ?? reservation.accountId) as string)
    : null
  const period = input.period ?? normalizeBookingPeriod({
    type: reservation.reservationType === 'seasonal'
      ? 'seasonal'
      : reservation.startDate === reservation.endDate
        ? 'daily'
        : 'multi_day',
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    label: reservation.reservationType,
  })

  const warnings: string[] = []
  const suggestion = await suggestPriceForItem(item, reservation.reservationType, reservation.startDate)
  const dayCount = getDayCount(reservation)
  const pricingAvailable = suggestion.confidence !== 'none'
  if (!pricingAvailable) {
    warnings.push('pricing_unavailable')
  }

  const suggestedBasePrice = pricingAvailable
    ? suggestion.amountCents * (reservation.reservationType === 'daily' ? dayCount : 1)
    : 0
  const manualOverride = input.manualOverride ?? null
  const basePrice = manualOverride?.amountCents ?? suggestedBasePrice
  const extras = account ? await getExtraItemsForAccount(account.id) : []
  const includedItems = await getIncludedItemsForTariffContext(
    item.type,
    item.rowLabel,
    reservation.reservationType,
  )
  const extraLines = buildExtraLines(extras)
  const includedLines = buildIncludedLines(includedItems)
  const extrasTotal = extraLines.reduce((sum, line) => sum + line.totalPrice, 0)
  const baseLine: PricingSnapshotLine = {
    id: createLineId('base', reservation.id),
    type: 'base_item',
    sourceRuleId: suggestion.tariffRule?.id ?? null,
    description: suggestion.tariffRule?.name ?? `Posto ${item.code}`,
    quantity: 1,
    unitPrice: basePrice,
    totalPrice: basePrice,
    included: false,
    metadata: {
      itemCode: item.code,
      dayCount,
      confidence: suggestion.confidence,
      reason: suggestion.reason,
    },
  }
  const manualLine: PricingSnapshotLine[] = manualOverride
    ? [{
        id: createLineId('manual', reservation.id),
        type: 'manual_adjustment',
        description: manualOverride.reason ?? 'Importo manuale',
        quantity: 1,
        unitPrice: manualOverride.amountCents - suggestedBasePrice,
        totalPrice: manualOverride.amountCents - suggestedBasePrice,
        included: false,
        metadata: {
          previousAmountCents: manualOverride.previousAmountCents ?? suggestedBasePrice,
        },
      }]
    : []
  const lines = [baseLine, ...includedLines, ...extraLines, ...manualLine]
  const calculatedTotal = basePrice + extrasTotal
  const snapshot: PricingSnapshot = {
    id: input.persist === false ? `pricing-snapshot-preview-${reservation.id}` : '',
    reservationId: reservation.id,
    accountId: account?.id ?? input.accountId ?? null,
    source: input.source,
    status: 'locked',
    sourceRuleId: suggestion.tariffRule?.id ?? null,
    catalogItemId: null,
    periodType: period.type,
    scope: {
      reservationId: reservation.id,
      itemId: item.id,
      itemKind: item.type,
      rowKey: item.rowLabel,
      periodType: period.type,
      periodStart: period.startDate,
      periodEnd: period.endDate,
      customerId: input.customerId ?? reservation.customerId,
    },
    basePrice,
    extrasTotal,
    discountsTotal: 0,
    includedItems,
    lines,
    calculatedTotal,
    manualOverride: manualOverride
      ? {
          ...manualOverride,
          enabled: manualOverride.enabled ?? true,
          source: manualOverride.source ?? input.source,
          updatedAt: manualOverride.updatedAt ?? new Date().toISOString(),
        }
      : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return {
    snapshot,
    warnings,
    pricingAvailable,
    requiresManualReview: !pricingAvailable,
  }
}

export const createPricingSnapshot = async (
  input: PricingSnapshotInput,
): Promise<PricingSnapshotResult> => {
  const result = await buildPricingSnapshot(input)
  const persisted = await persistPricingSnapshot({
    ...result.snapshot,
    id: undefined,
    status: 'locked',
  })
  await linkPricingSnapshotToReservation(result.snapshot.reservationId, persisted.id)
  if (result.snapshot.accountId) {
    await linkPricingSnapshotToAccount(result.snapshot.accountId, persisted.id)
  }
  const linked = await getPricingSnapshotById(persisted.id)
  const snapshot = toSnapshot(linked ?? persisted)
  await appendPricingEvent({
    type: 'pricing_snapshot_created',
    severity: result.pricingAvailable ? 'success' : 'warning',
    title: result.pricingAvailable ? 'Prezzo prenotazione salvato' : 'Prezzo prenotazione da verificare',
    description: result.warnings.join(', ') || null,
    links: {
      entityType: 'pricing_snapshot',
      entityId: snapshot.id,
      reservationId: snapshot.reservationId,
      customerId: snapshot.scope.customerId ?? null,
      accountId: snapshot.accountId ?? null,
      itemId: snapshot.scope.itemId ?? null,
      pricingSnapshotId: snapshot.id,
    },
    amountCents: snapshot.calculatedTotal,
    payload: {
      pricingAvailable: result.pricingAvailable,
      requiresManualReview: result.requiresManualReview,
      warnings: result.warnings,
    },
    dedupeKey: `pricing_snapshot_created:${snapshot.id}`,
  })
  return {
    ...result,
    snapshot,
  }
}

export const getPricingSnapshotForReservation = async (
  reservationId: string,
): Promise<PricingSnapshot | null> => {
  const snapshot = await getPersistedPricingSnapshotForReservation(reservationId)
  return snapshot ? toSnapshot(snapshot) : null
}

export const voidPricingSnapshot = async (
  snapshotId: string,
  reason: string,
): Promise<PricingSnapshot> => {
  return toSnapshot(await updatePricingSnapshotStatus(snapshotId, 'voided', { reason }))
}

export const supersedePricingSnapshot = async (
  oldSnapshotId: string,
  newInput: PricingSnapshotInput,
): Promise<PricingSnapshotResult> => {
  await updatePricingSnapshotStatus(oldSnapshotId, 'superseded', { reason: 'reprice' })
  return createPricingSnapshot(newInput)
}

export const compareSnapshotToCurrentPricing = async (
  reservationId: string,
): Promise<{
  snapshot: PricingSnapshot | null
  current: PricingSnapshotResult
  changed: boolean
  deltaCents: number
}> => {
  const snapshot = await getPricingSnapshotForReservation(reservationId)
  const reservation = await getReservation(reservationId)
  if (!reservation) {
    throw new Error('Prenotazione non trovata.')
  }
  const current = await buildPricingSnapshot({
    reservationId,
    accountId: reservation.accountId,
    itemId: reservation.itemId,
    customerId: reservation.customerId,
    source: 'system',
    persist: false,
  })
  const deltaCents = current.snapshot.calculatedTotal - (snapshot?.calculatedTotal ?? 0)
  return {
    snapshot,
    current,
    changed: Boolean(snapshot && deltaCents !== 0),
    deltaCents,
  }
}

export const listPricingSnapshotsForReservation = async (
  reservationId: string,
): Promise<PricingSnapshot[]> =>
  (await listPersistedPricingSnapshotsForReservation(reservationId)).map(toSnapshot)

export const getPricingSnapshotHistoryForReservation = listPricingSnapshotsForReservation

export const getPricingSnapshot = async (
  snapshotId: string,
): Promise<PricingSnapshot | null> => {
  const snapshot = await getPricingSnapshotById(snapshotId)
  return snapshot ? toSnapshot(snapshot) : null
}

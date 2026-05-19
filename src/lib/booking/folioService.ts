import {
  addPayment,
  cancelAccount,
  createAccountForAssignment,
  getAccount,
  getActiveAccountForItem,
  getPaymentsForAccount,
  updateAccountTotal,
} from '../db/accountRepository'
import { linkBookingFolio } from '../db/bookingRepository'
import { getExtraItemsForAccount } from '../db/extraItemRepository'
import { getReservation, getReservationsForCustomer, updateReservation } from '../db/reservationRepository'
import type { Account, Payment } from '../types/account'
import type { AccountExtraItem } from '../types/extraItem'
import type { Reservation } from '../types/reservation'
import { deriveFolioStatus, requiresFolioManualReview } from './folioStatus'
import type {
  ApplyManualAdjustmentInput,
  CancelFolioForReservationInput,
  FolioLine,
  FolioLinePreviewContext,
  FolioLineType,
  FolioOperationResult,
  FolioSource,
  FolioSummary,
  PrepareFolioForBookingInput,
  RebuildFolioLinesInput,
  RegisterManualPaymentInput,
} from './folio.types'
import {
  createPricingSnapshot,
  getPricingSnapshot,
  getPricingSnapshotForReservation,
} from './pricingSnapshotService'
import type { PricingSnapshot, PricingSnapshotLine } from './pricingSnapshot.types'
import { appendFolioEvent, appendPaymentEvent } from '../registry/registryEventService'

const nowIso = () => new Date().toISOString()

const mapSnapshotLineType = (line: PricingSnapshotLine): FolioLineType => {
  if (line.type === 'base_item') return 'base_booking'
  if (line.type === 'included_item') return 'article'
  if (line.type === 'extra') return 'extra'
  if (line.type === 'discount') return 'discount'
  if (line.type === 'manual_adjustment') return 'manual_adjustment'
  return 'service'
}

const toBookingFolioLinkStatus = (
  status: ReturnType<typeof deriveFolioStatus>,
): 'to_prepare' | 'open' | 'partial' | 'paid' | 'cancelled' => {
  if (status === 'closed') return 'paid'
  if (status === 'manual_review') return 'partial'
  return status
}

const toFolioLine = (context: FolioLinePreviewContext): FolioLine => ({
  id: `folio-line-preview-${context.snapshotLine.id}`,
  folioId: context.accountId,
  accountId: context.accountId,
  reservationId: context.reservationId ?? null,
  pricingSnapshotId: context.pricingSnapshotId ?? null,
  articleId: context.snapshotLine.articleId ?? null,
  type: mapSnapshotLineType(context.snapshotLine),
  description: context.snapshotLine.description,
  quantity: context.snapshotLine.quantity,
  unitAmountCents: context.snapshotLine.unitPrice,
  totalAmountCents: context.snapshotLine.totalPrice,
  source: context.source,
  createdAt: context.createdAt,
  metadata: {
    ...context.snapshotLine.metadata,
    included: context.snapshotLine.included,
    sourceRuleId: context.snapshotLine.sourceRuleId ?? null,
    persistence: 'preview',
  },
})

const extraToFolioLine = (
  extra: AccountExtraItem,
  input: {
    accountId: string
    reservationId?: string | null
    pricingSnapshotId?: string | null
    source: FolioSource
    createdAt: string
  },
): FolioLine => ({
  id: `folio-line-extra-${extra.id}`,
  folioId: input.accountId,
  accountId: input.accountId,
  reservationId: input.reservationId ?? null,
  pricingSnapshotId: input.pricingSnapshotId ?? null,
  articleId: extra.catalogItemId ?? null,
  type: 'extra',
  description: extra.name,
  quantity: extra.quantity,
  unitAmountCents: extra.unitAmountCents,
  totalAmountCents: extra.totalAmountCents,
  source: input.source,
  createdAt: input.createdAt,
  metadata: {
    accountExtraItemId: extra.id,
    persistence: 'account_extra_items',
  },
})

const findReservationForAccount = async (account: Account): Promise<Reservation | null> => {
  const reservations = await getReservationCandidates(account)
  return reservations.find((reservation) => reservation.accountId === account.id) ?? null
}

const getReservationCandidates = async (account: Account): Promise<Reservation[]> => {
  return getReservationsForCustomer(account.customerId)
}

const getPricingSnapshotForContext = async (
  reservationId?: string | null,
  pricingSnapshotId?: string | null,
): Promise<PricingSnapshot | null> => {
  if (pricingSnapshotId) return getPricingSnapshot(pricingSnapshotId)
  if (reservationId) return getPricingSnapshotForReservation(reservationId)
  return null
}

const buildSummary = async (input: {
  account: Account
  reservation?: Reservation | null
  payments?: Payment[]
  pricingSnapshot?: PricingSnapshot | null
  lineCount?: number
  pricingAvailable?: boolean
}): Promise<FolioSummary> => {
  const payments = input.payments ?? await getPaymentsForAccount(input.account.id)
  const pricingSnapshot = input.pricingSnapshot ??
    (input.reservation ? await getPricingSnapshotForReservation(input.reservation.id) : null)
  const status = deriveFolioStatus(
    input.account.totalAmountCents,
    input.account.paidAmountCents,
    input.account.balanceAmountCents,
    input.account.status,
  )
  const pricingAvailable = input.pricingAvailable ?? Boolean(pricingSnapshot)
  return {
    accountId: input.account.id,
    reservationId: input.reservation?.id ?? pricingSnapshot?.reservationId ?? null,
    customerId: input.account.customerId,
    totalAmountCents: input.account.totalAmountCents,
    paidAmountCents: input.account.paidAmountCents,
    residualAmountCents: input.account.balanceAmountCents,
    status,
    lineCount: input.lineCount ?? 0,
    paymentCount: payments.length,
    pricingSnapshotId: pricingSnapshot?.id ?? null,
    pricingAvailable,
    requiresManualReview: requiresFolioManualReview({
      status,
      totalAmountCents: input.account.totalAmountCents,
      paidAmountCents: input.account.paidAmountCents,
      residualAmountCents: input.account.balanceAmountCents,
      pricingAvailable,
    }),
    updatedAt: input.account.updatedAt,
  }
}

export const getFolioSummary = async (accountId: string): Promise<FolioSummary> => {
  const account = await getAccount(accountId)
  if (!account) throw new Error('Conto non trovato.')
  const reservation = await findReservationForAccount(account)
  const lines = await rebuildFolioLinesFromSnapshot({
    accountId,
    reservationId: reservation?.id ?? null,
    source: 'system',
  })
  return {
    ...lines.summary,
    lineCount: lines.lines?.length ?? 0,
  }
}

export const getFolioForReservation = async (
  reservationId: string,
): Promise<FolioOperationResult> => {
  const reservation = await getReservation(reservationId)
  if (!reservation) throw new Error('Prenotazione non trovata.')
  if (!reservation.accountId) {
    throw new Error('Conto non preparato.')
  }
  return rebuildFolioLinesFromSnapshot({
    accountId: reservation.accountId,
    reservationId,
    source: 'system',
  })
}

export const prepareFolioForBooking = async (
  input: PrepareFolioForBookingInput,
): Promise<FolioOperationResult> => {
  const reservation = await getReservation(input.reservationId)
  if (!reservation) throw new Error('Prenotazione non trovata.')

  let account = reservation.accountId ? await getAccount(reservation.accountId) : null
  account = account ?? await getActiveAccountForItem(input.itemId ?? reservation.itemId)

  let snapshot = await getPricingSnapshotForContext(input.reservationId, input.pricingSnapshotId)
  if (!snapshot) {
    const result = await createPricingSnapshot({
      reservationId: reservation.id,
      accountId: account?.id ?? null,
      itemId: input.itemId ?? reservation.itemId,
      customerId: input.customerId ?? reservation.customerId,
      source: input.source,
    })
    snapshot = result.snapshot
  }

  if (!account) {
    account = await createAccountForAssignment({
      itemId: input.itemId ?? reservation.itemId,
      customerId: input.customerId ?? reservation.customerId,
      assignmentId: reservation.assignmentId,
      accountType: reservation.reservationType,
      seasonLabel: reservation.reservationType === 'seasonal'
        ? String(new Date(reservation.startDate).getFullYear())
        : null,
      totalAmountCents: snapshot.calculatedTotal,
      notes: snapshot.sourceRuleId ? 'Da Articoli' : 'Manuale',
    })
  }

  if (reservation.accountId !== account.id) {
    await updateReservation(reservation.id, {
      itemId: reservation.itemId,
      customerId: reservation.customerId,
      assignmentId: reservation.assignmentId,
      accountId: account.id,
      reservationType: reservation.reservationType,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      title: reservation.title,
      notes: reservation.notes,
    })
  }

  await linkBookingFolio({
    reservationId: reservation.id,
    accountId: account.id,
    status: toBookingFolioLinkStatus(deriveFolioStatus(
      account.totalAmountCents,
      account.paidAmountCents,
      account.balanceAmountCents,
      account.status,
    )),
  })
  await appendFolioEvent({
    type: reservation.accountId ? 'folio_updated' : 'folio_created',
    severity: snapshot.sourceRuleId ? 'success' : 'warning',
    title: reservation.accountId ? 'Conto prenotazione aggiornato' : 'Conto prenotazione preparato',
    links: {
      entityType: 'account',
      entityId: account.id,
      reservationId: reservation.id,
      customerId: account.customerId,
      accountId: account.id,
      itemId: account.itemId,
      pricingSnapshotId: snapshot.id,
    },
    amountCents: account.totalAmountCents,
    payload: {
      status: account.status,
      balanceAmountCents: account.balanceAmountCents,
      pricingSnapshotId: snapshot.id,
    },
    dedupeKey: `${reservation.accountId ? 'folio_updated' : 'folio_created'}:${reservation.id}:${account.id}:${snapshot.id}`,
  })

  return rebuildFolioLinesFromSnapshot({
    accountId: account.id,
    reservationId: reservation.id,
    pricingSnapshotId: snapshot.id,
    source: input.source,
  })
}

export const rebuildFolioLinesFromSnapshot = async (
  input: RebuildFolioLinesInput,
): Promise<FolioOperationResult> => {
  const account = await getAccount(input.accountId)
  if (!account) throw new Error('Conto non trovato.')
  const reservation = input.reservationId ? await getReservation(input.reservationId) : await findReservationForAccount(account)
  const snapshot = await getPricingSnapshotForContext(reservation?.id ?? null, input.pricingSnapshotId)
  const extras = await getExtraItemsForAccount(account.id)
  const createdAt = nowIso()
  const snapshotLines = snapshot?.lines.map((line) =>
    toFolioLine({
      snapshotLine: line,
      accountId: account.id,
      reservationId: reservation?.id ?? null,
      pricingSnapshotId: snapshot.id,
      source: input.source,
      createdAt,
    }),
  ) ?? []
  const snapshotExtraIds = new Set(
    snapshotLines
      .map((line) => String(line.metadata?.accountExtraItemId ?? ''))
      .filter(Boolean),
  )
  const extraLines = extras
    .filter((extra) => !snapshotExtraIds.has(extra.id))
    .map((extra) =>
      extraToFolioLine(extra, {
        accountId: account.id,
        reservationId: reservation?.id ?? null,
        pricingSnapshotId: snapshot?.id ?? null,
        source: input.source,
        createdAt,
      }),
    )
  const lines = [...snapshotLines, ...extraLines]
  const summary = await buildSummary({
    account,
    reservation,
    pricingSnapshot: snapshot,
    lineCount: lines.length,
  })
  const warnings: string[] = ['folio_lines_preview_only']
  if (!snapshot) warnings.push('pricing_snapshot_missing')
  return {
    summary,
    lines,
    warnings,
    requiresManualReview: summary.requiresManualReview,
  }
}

export const registerManualPayment = async (
  input: RegisterManualPaymentInput,
): Promise<FolioOperationResult> => {
  const payment = await addPayment(input.accountId, input.amountCents, input.paymentMethod, input.note)
  const account = await getAccount(input.accountId)
  await appendPaymentEvent({
    type: 'payment_recorded',
    severity: 'success',
    title: 'Pagamento registrato',
    description: input.note?.trim() || null,
    links: {
      entityType: 'payment',
      entityId: payment.id,
      accountId: input.accountId,
      paymentId: payment.id,
      customerId: account?.customerId ?? null,
      itemId: account?.itemId ?? null,
    },
    amountCents: input.amountCents,
    payload: { paymentMethod: input.paymentMethod, source: input.source },
    dedupeKey: `payment_recorded:${payment.id}`,
  })
  return rebuildFolioLinesFromSnapshot({
    accountId: input.accountId,
    source: input.source,
  })
}

export const applyManualAdjustment = async (
  input: ApplyManualAdjustmentInput,
): Promise<FolioOperationResult> => {
  const account = await updateAccountTotal(input.accountId, input.totalAmountCents, input.reason ?? 'Manuale')
  await appendFolioEvent({
    type: 'folio_updated',
    severity: 'warning',
    title: 'Conto aggiornato manualmente',
    description: input.reason ?? null,
    links: {
      entityType: 'account',
      entityId: account.id,
      accountId: account.id,
      customerId: account.customerId,
      itemId: account.itemId,
    },
    amountCents: account.totalAmountCents,
    payload: { source: input.source, balanceAmountCents: account.balanceAmountCents },
    dedupeKey: `folio_manual_adjustment:${account.id}:${account.updatedAt}`,
  })
  const result = await rebuildFolioLinesFromSnapshot({
    accountId: input.accountId,
    source: input.source,
  })
  return {
    ...result,
    warnings: [...result.warnings, 'manual_adjustment_account_total_updated'],
  }
}

export const cancelFolioForReservation = async (
  input: CancelFolioForReservationInput,
): Promise<FolioOperationResult> => {
  const reservation = await getReservation(input.reservationId)
  if (!reservation) throw new Error('Prenotazione non trovata.')
  if (!reservation.accountId) throw new Error('Conto non preparato.')
  const account = await getAccount(reservation.accountId)
  if (!account) throw new Error('Conto non trovato.')

  if (account.paidAmountCents > 0) {
    const result = await rebuildFolioLinesFromSnapshot({
      accountId: account.id,
      reservationId: reservation.id,
      source: input.source,
    })
    await appendFolioEvent({
      type: 'folio_manual_review_required',
      severity: 'warning',
      title: 'Revisione conto richiesta',
      description: 'Prenotazione annullata con pagamenti presenti.',
      links: {
        entityType: 'account',
        entityId: account.id,
        reservationId: reservation.id,
        accountId: account.id,
        customerId: account.customerId,
        itemId: account.itemId,
      },
      amountCents: account.paidAmountCents,
      payload: { reason: 'cancel_with_payment', source: input.source },
      dedupeKey: `folio_manual_review_required:${reservation.id}:${account.id}`,
    })
    await appendFolioEvent({
      type: 'credit_or_refund_required',
      severity: 'warning',
      title: 'Credito o rimborso da valutare',
      description: 'Il pagamento resta registrato e richiede gestione manuale.',
      links: {
        entityType: 'account',
        entityId: account.id,
        reservationId: reservation.id,
        accountId: account.id,
        customerId: account.customerId,
        itemId: account.itemId,
      },
      amountCents: account.paidAmountCents,
      payload: { reason: 'cancel_with_payment', source: input.source },
      dedupeKey: `credit_or_refund_required:${reservation.id}:${account.id}`,
    })
    return {
      ...result,
      warnings: [...result.warnings, 'payment_exists_manual_review_required', 'reversal_or_credit_required'],
      requiresManualReview: true,
      summary: {
        ...result.summary,
        status: 'manual_review',
        requiresManualReview: true,
      },
    }
  }

  await cancelAccount(account.id)
  await linkBookingFolio({
    reservationId: reservation.id,
    accountId: account.id,
    status: 'cancelled',
  })
  await appendFolioEvent({
    type: 'folio_updated',
    severity: 'info',
    title: 'Conto annullato',
    links: {
      entityType: 'account',
      entityId: account.id,
      reservationId: reservation.id,
      accountId: account.id,
      customerId: account.customerId,
      itemId: account.itemId,
    },
    payload: { source: input.source, status: 'cancelled' },
    dedupeKey: `folio_cancelled:${reservation.id}:${account.id}`,
  })
  return rebuildFolioLinesFromSnapshot({
    accountId: account.id,
    reservationId: reservation.id,
    source: input.source,
  })
}

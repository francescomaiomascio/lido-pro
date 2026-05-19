import type { Account } from '../types/account'
import type { NormalizedBookingPeriod } from './bookingPeriod.types'
import { compareBookingPeriods } from './bookingPeriodService'
import type { BookingAccountImpactPreview } from './bookingAccountImpact.types'

const noWrite = (
  input: Omit<BookingAccountImpactPreview, 'destructiveWriteAllowed'>,
): BookingAccountImpactPreview => ({
  ...input,
  destructiveWriteAllowed: false,
})

export const previewPeriodChangeAccountImpact = (input: {
  account: Account | null
  oldPeriod: NormalizedBookingPeriod
  newPeriod: NormalizedBookingPeriod
}): BookingAccountImpactPreview => {
  const account = input.account
  if (!account) {
    return noWrite({
      status: 'no_account',
      account: null,
      oldPeriod: input.oldPeriod,
      newPeriod: input.newPeriod,
      totalAmountCents: 0,
      paidAmountCents: 0,
      balanceAmountCents: 0,
      reason: 'Nessun conto collegato.',
    })
  }

  const comparison = compareBookingPeriods(input.oldPeriod, input.newPeriod)
  if (!comparison.changed) {
    return noWrite({
      status: 'unchanged',
      account,
      oldPeriod: input.oldPeriod,
      newPeriod: input.newPeriod,
      totalAmountCents: account.totalAmountCents,
      paidAmountCents: account.paidAmountCents,
      balanceAmountCents: account.balanceAmountCents,
      reason: 'Periodo invariato.',
    })
  }

  if (account.paidAmountCents > 0) {
    return noWrite({
      status: 'manual_review_required',
      account,
      oldPeriod: input.oldPeriod,
      newPeriod: input.newPeriod,
      totalAmountCents: account.totalAmountCents,
      paidAmountCents: account.paidAmountCents,
      balanceAmountCents: account.balanceAmountCents,
      reason: 'Il conto ha pagamenti registrati: serve revisione manuale prima di ricalcolare.',
    })
  }

  return noWrite({
    status: account.balanceAmountCents !== 0 ? 'residual_changed' : 'recalculate_needed',
    account,
    oldPeriod: input.oldPeriod,
    newPeriod: input.newPeriod,
    totalAmountCents: account.totalAmountCents,
    paidAmountCents: account.paidAmountCents,
    balanceAmountCents: account.balanceAmountCents,
    reason: 'Il cambio periodo puo richiedere ricalcolo del conto in BOOKING.7/8.',
  })
}

export const previewCancellationAccountImpact = (input: {
  account: Account | null
}): BookingAccountImpactPreview => {
  const account = input.account
  if (!account) {
    return noWrite({
      status: 'no_account',
      account: null,
      totalAmountCents: 0,
      paidAmountCents: 0,
      balanceAmountCents: 0,
      reason: 'Nessun conto collegato.',
    })
  }

  if (account.paidAmountCents > 0) {
    return noWrite({
      status: account.balanceAmountCents < 0 ? 'credit_required' : 'refund_required',
      account,
      totalAmountCents: account.totalAmountCents,
      paidAmountCents: account.paidAmountCents,
      balanceAmountCents: account.balanceAmountCents,
      reason: 'Il conto ha pagamenti: non cancellare pagamenti, preparare credito/rimborso o revisione manuale.',
    })
  }

  if (account.balanceAmountCents > 0) {
    return noWrite({
      status: 'residual_to_cancel',
      account,
      totalAmountCents: account.totalAmountCents,
      paidAmountCents: account.paidAmountCents,
      balanceAmountCents: account.balanceAmountCents,
      reason: 'Residuo aperto da stornare o azzerare manualmente nel conto.',
    })
  }

  return noWrite({
    status: 'no_payment_no_balance',
    account,
    totalAmountCents: account.totalAmountCents,
    paidAmountCents: account.paidAmountCents,
    balanceAmountCents: account.balanceAmountCents,
    reason: 'Nessun pagamento e nessun saldo residuo.',
  })
}

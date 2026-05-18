import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import { getAssignedCustomerForItem, searchCustomers } from '../db/customerRepository'
import { addPaymentAndReload } from './accountService'
import { savePeriodAndEnsureAccount } from './bookingFlowService'
import { assignCustomerToItem, createCustomer } from './customerService'
import type { PaymentMethod } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { ReservationType } from '../types/reservation'

type DemoCustomerSpec = {
  fullName: string
  phone: string
  email: string
  notes: string
  reservationType: ReservationType
  startOffsetDays: number
  endOffsetDays: number
  amountCents: number
  paymentCents: number
  paymentMethod: PaymentMethod
}

export type DemoOperationsSeedResult = {
  createdCustomers: number
  skippedCustomers: number
  createdReservations: number
  createdAccounts: number
  createdPayments: number
}

const DEMO_CUSTOMERS: DemoCustomerSpec[] = [
  {
    fullName: 'Mario Rossi',
    phone: '+39 333 1234567',
    email: 'mario.rossi@demo.lidopro',
    notes: 'Cliente stagionale demo con acconto registrato.',
    reservationType: 'seasonal',
    startOffsetDays: -14,
    endOffsetDays: 92,
    amountCents: 120000,
    paymentCents: 45000,
    paymentMethod: 'transfer',
  },
  {
    fullName: 'Laura Bianchi',
    phone: '+39 347 2201144',
    email: 'laura.bianchi@demo.lidopro',
    notes: 'Prenotazione giornaliera demo con saldo aperto.',
    reservationType: 'daily',
    startOffsetDays: 0,
    endOffsetDays: 1,
    amountCents: 9800,
    paymentCents: 5000,
    paymentMethod: 'card',
  },
  {
    fullName: 'Giulia Verdi',
    phone: '+39 320 8884411',
    email: 'giulia.verdi@demo.lidopro',
    notes: 'Cliente demo con conto saldato.',
    reservationType: 'daily',
    startOffsetDays: -1,
    endOffsetDays: 2,
    amountCents: 15600,
    paymentCents: 15600,
    paymentMethod: 'cash',
  },
  {
    fullName: 'Luca Ferri',
    phone: '+39 339 7710255',
    email: 'luca.ferri@demo.lidopro',
    notes: 'Cliente demo con conto ancora da incassare.',
    reservationType: 'daily',
    startOffsetDays: 0,
    endOffsetDays: 0,
    amountCents: 7200,
    paymentCents: 0,
    paymentMethod: 'cash',
  },
  {
    fullName: 'Sara Conti',
    phone: '+39 331 9021188',
    email: 'sara.conti@demo.lidopro',
    notes: 'Cliente demo con pacchetto settimanale.',
    reservationType: 'daily',
    startOffsetDays: -2,
    endOffsetDays: 5,
    amountCents: 38500,
    paymentCents: 20000,
    paymentMethod: 'card',
  },
  {
    fullName: 'Paolo Romano',
    phone: '+39 335 4412099',
    email: 'paolo.romano@demo.lidopro',
    notes: 'Cliente stagionale demo con saldo importante.',
    reservationType: 'seasonal',
    startOffsetDays: -20,
    endOffsetDays: 104,
    amountCents: 145000,
    paymentCents: 65000,
    paymentMethod: 'transfer',
  },
  {
    fullName: 'Elena Costa',
    phone: '+39 348 1197744',
    email: 'elena.costa@demo.lidopro',
    notes: 'Prenotazione demo weekend.',
    reservationType: 'daily',
    startOffsetDays: 1,
    endOffsetDays: 3,
    amountCents: 18200,
    paymentCents: 0,
    paymentMethod: 'other',
  },
  {
    fullName: 'Matteo Ricci',
    phone: '+39 327 6509933',
    email: 'matteo.ricci@demo.lidopro',
    notes: 'Cliente demo con pagamento bancomat.',
    reservationType: 'daily',
    startOffsetDays: -3,
    endOffsetDays: 0,
    amountCents: 22400,
    paymentCents: 22400,
    paymentMethod: 'card',
  },
  {
    fullName: 'Chiara Greco',
    phone: '+39 340 8824410',
    email: 'chiara.greco@demo.lidopro',
    notes: 'Cliente demo con acconto in contanti.',
    reservationType: 'daily',
    startOffsetDays: 0,
    endOffsetDays: 4,
    amountCents: 31000,
    paymentCents: 10000,
    paymentMethod: 'cash',
  },
  {
    fullName: 'Davide Moretti',
    phone: '+39 328 7711400',
    email: 'davide.moretti@demo.lidopro',
    notes: 'Cliente demo stagionale in attesa saldo.',
    reservationType: 'seasonal',
    startOffsetDays: -7,
    endOffsetDays: 88,
    amountCents: 132000,
    paymentCents: 30000,
    paymentMethod: 'transfer',
  },
]

const toLocalIsoDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (offsetDays: number): string => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offsetDays)
  return toLocalIsoDate(date)
}

const sortSeedItems = (items: BeachItem[]) =>
  items.toSorted(
    (a, b) =>
      a.rowIndex - b.rowIndex ||
      a.numberIndex - b.numberIndex ||
      a.code.localeCompare(b.code),
  )

const selectSeedItems = async (): Promise<BeachItem[]> => {
  const layout = await getActiveLayout()
  const items = sortSeedItems((await getBeachItems(layout.id)).filter((item) => item.active))
  const unusedItems = items.filter(
    (item) => !item.assignedCustomer && !item.activeAccount && !item.currentReservation,
  )
  return unusedItems.length >= DEMO_CUSTOMERS.length ? unusedItems : items
}

export const seedDemoOperationsIfNeeded = async (): Promise<DemoOperationsSeedResult> => {
  const existingCustomers = await searchCustomers('')
  const existingNames = new Set(existingCustomers.map((customer) => customer.fullName.toLowerCase()))
  const missingSpecs = DEMO_CUSTOMERS.filter((spec) => !existingNames.has(spec.fullName.toLowerCase()))

  if (missingSpecs.length === 0) {
    return {
      createdCustomers: 0,
      skippedCustomers: DEMO_CUSTOMERS.length,
      createdReservations: 0,
      createdAccounts: 0,
      createdPayments: 0,
    }
  }

  const seedItems = await selectSeedItems()
  if (seedItems.length < missingSpecs.length) {
    throw new Error('Posti spiaggia insufficienti per popolare i clienti demo.')
  }

  const result: DemoOperationsSeedResult = {
    createdCustomers: 0,
    skippedCustomers: DEMO_CUSTOMERS.length - missingSpecs.length,
    createdReservations: 0,
    createdAccounts: 0,
    createdPayments: 0,
  }

  for (const [index, spec] of missingSpecs.entries()) {
    const item = seedItems[index]
    const customer = await createCustomer({
      fullName: spec.fullName,
      phone: spec.phone,
      email: spec.email,
      notes: spec.notes,
    })
    result.createdCustomers += 1

    await assignCustomerToItem(item.id, customer.id, spec.reservationType, 'Seed demo locale')
    const assignedCustomer = await getAssignedCustomerForItem(item.id)
    if (!assignedCustomer) {
      throw new Error(`Assegnazione cliente demo non trovata per ${spec.fullName}.`)
    }

    const reservationResult = await savePeriodAndEnsureAccount({
      item,
      assignedCustomer,
      reservationType: spec.reservationType,
      startDate: addDays(spec.startOffsetDays),
      endDate: addDays(spec.endOffsetDays),
      manualAmountCents: spec.amountCents,
    })
    result.createdReservations += reservationResult.createdReservation ? 1 : 0
    result.createdAccounts += 1

    if (spec.paymentCents > 0) {
      await addPaymentAndReload(
        reservationResult.account.id,
        spec.paymentCents,
        spec.paymentMethod,
        'Movimento demo locale',
      )
      result.createdPayments += 1
    }
  }

  return result
}

import type { BeachItemStatus } from '../types/beach'

export const beachStatusLabels: Record<BeachItemStatus, string> = {
  free: 'Libero',
  occupied: 'Occupato',
  reserved: 'Prenotato',
  maintenance: 'Manutenzione',
}

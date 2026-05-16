import { ensureParametricLayoutImported } from './parametricLayoutRepository'

export async function importLegacyLayoutIfMissing(): Promise<void> {
  await ensureParametricLayoutImported()
}

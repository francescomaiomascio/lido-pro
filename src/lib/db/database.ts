import type { BeachDatabaseAdapter } from '../types/db'
import { getSQLiteAdapter } from './sqliteAdapter'

let adapter: BeachDatabaseAdapter | null = null

export const getBeachDatabase = (): BeachDatabaseAdapter => {
  adapter ??= getSQLiteAdapter()
  return adapter
}

export const resetDatabaseAdapterForTests = () => {
  adapter = null
}

export const resetBrowserDatabaseForDevelopmentOnly = async (): Promise<void> => {
  await getBeachDatabase().resetBrowserDatabaseForDevelopmentOnly()
  adapter = null
}

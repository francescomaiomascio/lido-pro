import { getBeachDatabase } from './database'
import type { DatabaseTableReadOptions } from '../types/db'

export const getDatabaseDiagnostics = () => getBeachDatabase().getDatabaseDiagnostics()

export const listDatabaseTables = () => getBeachDatabase().listDatabaseTables()

export const getTableRowCount = (tableName: string) =>
  getBeachDatabase().getTableRowCount(tableName)

export const readTableRows = (tableName: string, options?: DatabaseTableReadOptions) =>
  getBeachDatabase().readTableRows(tableName, options)

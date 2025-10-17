import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3';
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  //return drizzle(process.env.DATABASE_URL)
  const sqlite = new Database('local.db');
  return drizzle({ client: sqlite });
}

export type Entry = typeof schema.entries.$inferSelect
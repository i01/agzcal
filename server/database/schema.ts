import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const entries = sqliteTable('entries', {
  //id: integer('id').primaryKey({ autoIncrement: true }),
  id: text('id').$default(() => createId()).primaryKey(),
  title: text('title').notNull(),
  start: text('start').notNull(),
  end: text('end'),
  //allDay: integer('allDay', { mode: 'boolean' }).notNull(),
  //createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
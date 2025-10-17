import { INITIAL_EVENTS } from "~/event-utils"

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Run database seed task'
  },
  async run() {
    console.log('Running DB seed task...')
    await useDrizzle().insert(tables.entries).values(INITIAL_EVENTS)
    return { result: 'success' }
  }
})
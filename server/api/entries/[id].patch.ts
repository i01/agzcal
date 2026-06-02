export default eventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { title } = await readBody(event)
  const { start } = await readBody(event)
  const { end } = await readBody(event)

  const entry = useDrizzle().update(tables.entries).set({
    title,
    start,
    end
  }).where(eq(tables.entries.id, String(id))).returning().get()

  return entry
})
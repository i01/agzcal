export default eventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { title } = await readBody(event)
  const { start } = await readBody(event)
  const { end } = await readBody(event)

  const entry = await useDrizzle().update(tables.entries).set({
    title,
    start,
    end
  }).where(eq(tables.entries.id, id)).returning().get()
  console.log(title)

  return entry
})
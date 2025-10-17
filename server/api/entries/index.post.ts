export default eventHandler(async (event) => {
  const { id } = await readBody(event)
  const { title } = await readBody(event)
  const { start } = await readBody(event)
  const { end } = await readBody(event)

  const entry = await useDrizzle().insert(tables.entries).values({
    id,
    title,
    start,
    end
  }).returning().get()
  
  return entry
})
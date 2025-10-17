export default eventHandler(async (event) => {
  const { id } = getRouterParams(event)
  
  const deletedEntry = await useDrizzle().delete(tables.entries).where(and(
    eq(tables.entries.id, id)
  )).returning().get()

  if (!deletedEntry) {
    throw createError({
      statusCode: 404,
      message: 'Event not found'
    })
  }
  
  return deletedEntry
})
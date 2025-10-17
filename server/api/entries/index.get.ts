export default eventHandler(async () => {
  const entries = await useDrizzle().select().from(tables.entries).all()

  return entries
})
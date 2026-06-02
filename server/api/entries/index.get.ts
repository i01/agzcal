export default eventHandler(async () => {
  const entries = useDrizzle().select().from(tables.entries).all()

  return entries
})
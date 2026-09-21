/** number input の空欄 / NaN を undefined に揃える */
export function setAmountValueAs(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') {
      return undefined
    }
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return undefined
}

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from 'date-fns'

/** datetime-local 用のローカル日時文字列 (YYYY-MM-DDTHH:mm) */
export function toDateTimeLocalValue(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/** datetime-local 値を ISO 文字列へ変換 */
export function dateTimeLocalToIso(value: string): string {
  return new Date(value).toISOString()
}

export function formatClockTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

export function formatElapsedLabel(
  fromIso: string,
  to: Date = new Date(),
): string {
  const from = new Date(fromIso)
  const minutes = Math.max(0, differenceInMinutes(to, from))

  if (minutes < 60) {
    return `約${Math.max(1, minutes)}分`
  }

  const hours = differenceInHours(to, from)
  if (hours < 24) {
    const remainMinutes = minutes % 60
    if (remainMinutes === 0) {
      return `約${hours}時間`
    }
    return `約${hours}時間${remainMinutes}分`
  }

  const days = differenceInDays(to, from)
  return `約${days}日`
}

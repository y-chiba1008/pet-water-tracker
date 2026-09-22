import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  isSameDay,
} from 'date-fns'

/** datetime-local 用のローカル日時文字列 (YYYY-MM-DDTHH:mm) */
export function toDateTimeLocalValue(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/** datetime-local 値を ISO 文字列へ変換 */
export function dateTimeLocalToIso(value: string): string {
  return new Date(value).toISOString()
}

/** datetime-local 入力との比較用に秒未満を切り捨てる */
export function truncateToMinute(date: Date): Date {
  const truncated = new Date(date)
  truncated.setSeconds(0, 0)
  return truncated
}

export function formatClockTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

export function formatElapsedLabel(
  fromIso: string,
  to: Date = new Date(),
): string {
  return formatElapsedDuration(fromIso, to)
}

/** 水皿一覧向け: 「交換から8時間経過」 */
export function formatExchangeElapsedLabel(
  fromIso: string,
  to: Date = new Date(),
): string {
  return `交換から${formatElapsedDuration(fromIso, to)}経過`
}

/** 水皿一覧向け: 「前回の記録: 今日 11:30」 */
export function formatLatestCompletedAtLabel(
  endTimeIso: string,
  now: Date = new Date(),
): string {
  const end = new Date(endTimeIso)
  const time = format(end, 'HH:mm')

  if (isSameDay(end, now)) {
    return `前回の記録: 今日 ${time}`
  }

  return `前回の記録: ${format(end, 'M/d')} ${time}`
}

function formatElapsedDuration(fromIso: string, to: Date): string {
  const from = new Date(fromIso)
  const minutes = Math.max(0, differenceInMinutes(to, from))

  if (minutes < 60) {
    return `${Math.max(1, minutes)}分`
  }

  const hours = differenceInHours(to, from)
  if (hours < 24) {
    const remainMinutes = minutes % 60
    if (remainMinutes === 0) {
      return `${hours}時間`
    }
    return `${hours}時間${remainMinutes}分`
  }

  const days = differenceInDays(to, from)
  return `${days}日`
}

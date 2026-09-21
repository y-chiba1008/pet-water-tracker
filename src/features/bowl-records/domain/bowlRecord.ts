import { truncateToMinute } from '@/shared/lib/dateTime'
import type { BowlRecord } from '@/features/bowl-records/types'

/** 1サイクルの飲水量（開始容量 − 終了容量） */
export function calcWaterAmount(start: number, end: number): number {
  return start - end
}

/** 終了容量が開始容量より大きい場合は異常値 */
export function isAbnormal(start: number, end: number): boolean {
  return end > start
}

/** 進行中サイクル（終了時刻未入力）かどうか */
export function isActiveCycle(record: BowlRecord): boolean {
  return record.end_time === null
}

export type RecordedAtIssue = 'before_previous' | 'future'

export type RecordedAtConsistency =
  | { ok: true }
  | { ok: false; reason: RecordedAtIssue }

/**
 * 記録日時が「前回入力時刻以上・現在時刻以下」かを判定する。
 * datetime-local は分精度のため、比較は分単位に揃える。
 */
export function checkRecordedAtConsistency(
  recordedAt: Date | string,
  options: {
    previousAt?: Date | string | null
    now?: Date
  } = {},
): RecordedAtConsistency {
  const recorded = truncateToMinute(
    typeof recordedAt === 'string' ? new Date(recordedAt) : recordedAt,
  )

  if (Number.isNaN(recorded.getTime())) {
    return { ok: false, reason: 'future' }
  }

  const now = truncateToMinute(options.now ?? new Date())
  if (recorded.getTime() > now.getTime()) {
    return { ok: false, reason: 'future' }
  }

  if (options.previousAt != null && options.previousAt !== '') {
    const previous = truncateToMinute(
      typeof options.previousAt === 'string'
        ? new Date(options.previousAt)
        : options.previousAt,
    )
    if (
      !Number.isNaN(previous.getTime()) &&
      recorded.getTime() < previous.getTime()
    ) {
      return { ok: false, reason: 'before_previous' }
    }
  }

  return { ok: true }
}

export function recordedAtIssueMessage(reason: RecordedAtIssue): string {
  switch (reason) {
    case 'before_previous':
      return '前回の記録時刻以降の日時を入力してください'
    case 'future':
      return '現在時刻以前の日時を入力してください'
  }
}

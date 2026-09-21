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

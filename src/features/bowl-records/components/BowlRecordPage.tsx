import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BowlRecordForm } from '@/features/bowl-records/components/BowlRecordForm'
import { BowlSelector } from '@/features/bowl-records/components/BowlSelector'
import { useActiveCycles, useLatestCompletedCycle } from '@/features/bowl-records/hooks/useActiveCycle'
import {
  useCompleteCycleAndStartNext,
  useInsertStartRecord,
  useUpdateEndRecord,
} from '@/features/bowl-records/hooks/useBowlRecordMutations'
import { dateTimeLocalToIso } from '@/shared/lib/dateTime'
import type {
  ActiveCycleFormValues,
  NoActiveCycleFormValues,
} from '@/features/bowl-records/lib/bowlRecordFormSchema'
import type { BowlFormState } from '@/features/bowl-records/types'
import { useBowls } from '@/features/bowls/hooks/useBowls'
import { useAuth } from '@/features/login/hooks/useAuth'
import { AppShell } from '@/shared/components/AppShell'
import {
  FetchErrorMessage,
  LoadingMessage,
} from '@/shared/components/QueryStatusMessage'
import { Button } from '@/components/ui/button'

export function BowlRecordPage() {
  const { user } = useAuth()
  const {
    data: bowls = [],
    isLoading: bowlsLoading,
    isError: bowlsError,
    refetch: refetchBowls,
    isFetching: bowlsFetching,
  } = useBowls()
  const {
    data: activeCycles = [],
    isLoading: cyclesLoading,
    isError: cyclesError,
    refetch: refetchCycles,
    isFetching: cyclesFetching,
  } = useActiveCycles()

  const insertStart = useInsertStartRecord()
  const updateEnd = useUpdateEndRecord()
  const completeAndStart = useCompleteCycleAndStartNext()

  const [selectedBowlId, setSelectedBowlId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 2500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [successMessage])

  const activeCyclesByBowlId = useMemo(() => {
    const map = new Map(
      activeCycles.map((record) => [record.bowl_id, record] as const),
    )
    return map
  }, [activeCycles])

  const effectiveBowlId =
    selectedBowlId && bowls.some((bowl) => bowl.id === selectedBowlId)
      ? selectedBowlId
      : (bowls[0]?.id ?? null)

  const activeCycle = effectiveBowlId
    ? (activeCyclesByBowlId.get(effectiveBowlId) ?? null)
    : null

  const { data: latestCompleted = null } = useLatestCompletedCycle(
    effectiveBowlId && !activeCycle ? effectiveBowlId : null,
  )

  const previousRecordedAt = activeCycle
    ? activeCycle.start_time
    : (latestCompleted?.end_time ?? null)

  const formState: BowlFormState | null = effectiveBowlId
    ? activeCycle
      ? { mode: 'active-cycle', current: activeCycle }
      : { mode: 'no-active-cycle' }
    : null

  const isSubmitting =
    insertStart.isPending || updateEnd.isPending || completeAndStart.isPending

  const isLoading = bowlsLoading || cyclesLoading
  const isError = bowlsError || cyclesError

  async function handleNoActiveCycleSubmit(values: NoActiveCycleFormValues) {
    if (!user || !effectiveBowlId) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    try {
      await insertStart.mutateAsync({
        bowlId: effectiveBowlId,
        startTime: dateTimeLocalToIso(values.recordedAt),
        startAmountMl: values.startAmountMl,
        recordedBy: user.id,
      })
      setSuccessMessage('給水を開始しました。')
    } catch {
      setFormError('保存に失敗しました。もう一度お試しください。')
    }
  }

  async function handleActiveCycleSubmit(values: ActiveCycleFormValues) {
    if (!user || !effectiveBowlId || !activeCycle) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    const recordedAtIso = dateTimeLocalToIso(values.recordedAt)

    try {
      if (values.startAmountMl === undefined) {
        await updateEnd.mutateAsync({
          id: activeCycle.id,
          endTime: recordedAtIso,
          endAmountMl: values.endAmountMl,
          recordedBy: user.id,
        })
        setSuccessMessage('給水を終了しました。')
        return
      }

      await completeAndStart.mutateAsync({
        activeRecordId: activeCycle.id,
        bowlId: effectiveBowlId,
        endTime: recordedAtIso,
        endAmountMl: values.endAmountMl,
        startTime: recordedAtIso,
        startAmountMl: values.startAmountMl,
        recordedBy: user.id,
      })
      setSuccessMessage('水皿の交換を記録しました。')
    } catch {
      setFormError('保存に失敗しました。もう一度お試しください。')
    }
  }

  return (
    <AppShell title="水皿交換">
      <div className="relative flex flex-col gap-4 pt-4">
        {isLoading ? <LoadingMessage /> : null}

        {isError ? (
          <FetchErrorMessage
            message="水皿記録データの取得に失敗しました。もう一度お試しください。"
            isRetrying={bowlsFetching || cyclesFetching}
            onRetry={() => {
              void refetchBowls()
              void refetchCycles()
            }}
          />
        ) : null}

        {!isLoading && !isError && bowls.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
            <p className="font-heading text-base font-semibold text-[#292524]">
              水皿がまだありません
            </p>
            <p className="mt-1 text-sm text-[#78716C]">
              先に水皿管理から水皿を登録してください。
            </p>
            <Button
              type="button"
              asChild
              className="mt-4 h-12 rounded-full bg-[#0EA5E9] px-6 text-base font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7]"
            >
              <Link to="/bowls">水皿管理へ</Link>
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && bowls.length > 0 && formState ? (
          <>
            <BowlSelector
              bowls={bowls}
              activeCyclesByBowlId={activeCyclesByBowlId}
              selectedBowlId={effectiveBowlId}
              onSelect={(bowlId) => {
                setSelectedBowlId(bowlId)
                setFormError(null)
                setSuccessMessage(null)
              }}
            />

            <BowlRecordForm
              formState={formState}
              bowlKey={`${effectiveBowlId}:${formState.mode}:${activeCycle?.id ?? 'none'}`}
              previousRecordedAt={previousRecordedAt}
              isSubmitting={isSubmitting}
              errorMessage={formError}
              onSubmitNoActiveCycle={handleNoActiveCycleSubmit}
              onSubmitActiveCycle={handleActiveCycleSubmit}
            />
          </>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#292524] shadow-xl"
          >
            <span className="font-medium text-[#0284C7]">✓</span>
            {successMessage}
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}

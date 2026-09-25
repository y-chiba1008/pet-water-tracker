import { useMemo, useState } from 'react'
import { GlassWater, Plus } from 'lucide-react'
import { BowlFormDialog } from '@/features/bowls/components/BowlFormDialog'
import {
  BowlListItem,
  type BowlCycleDisplay,
} from '@/features/bowls/components/BowlListItem'
import { DeactivateBowlDialog } from '@/features/bowls/components/DeactivateBowlDialog'
import {
  useCreateBowl,
  useDeactivateBowl,
  useUpdateBowlName,
} from '@/features/bowls/hooks/useBowlMutations'
import { useBowls } from '@/features/bowls/hooks/useBowls'
import type { BowlFormValues } from '@/features/bowls/lib/bowlFormSchema'
import type { Bowl } from '@/features/bowls/types'
import {
  useActiveCycles,
  useLatestCompletedCyclesByBowlIds,
} from '@/features/bowl-records/hooks/useActiveCycle'
import {
  formatExchangeElapsedLabel,
  formatLatestCompletedAtLabel,
} from '@/shared/lib/dateTime'
import { AppShell } from '@/shared/components/AppShell'
import {
  FetchErrorMessage,
  LoadingMessage,
} from '@/shared/components/QueryStatusMessage'
import { Button } from '@/components/ui/button'

type FormDialogState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; bowl: Bowl }

type DeactivateDialogState =
  | { open: false }
  | { open: true; bowl: Bowl }

export function BowlListPage() {
  const { data: bowls = [], isLoading, isError, refetch, isFetching } =
    useBowls()
  const {
    data: activeCycles = [],
    isLoading: cyclesLoading,
    isError: cyclesError,
    refetch: refetchCycles,
    isFetching: cyclesFetching,
  } = useActiveCycles()
  const createBowl = useCreateBowl()
  const updateBowlName = useUpdateBowlName()
  const deactivateBowl = useDeactivateBowl()

  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false })
  const [deactivateDialog, setDeactivateDialog] =
    useState<DeactivateDialogState>({ open: false })
  const [formError, setFormError] = useState<string | null>(null)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  const activeCyclesByBowlId = useMemo(() => {
    return new Map(
      activeCycles.map((record) => [record.bowl_id, record] as const),
    )
  }, [activeCycles])

  const standbyBowlIds = useMemo(
    () =>
      bowls
        .filter((bowl) => !activeCyclesByBowlId.has(bowl.id))
        .map((bowl) => bowl.id),
    [bowls, activeCyclesByBowlId],
  )

  const {
    data: latestCompletedByBowlId = new Map(),
    isLoading: latestLoading,
    isError: latestError,
    refetch: refetchLatest,
    isFetching: latestFetching,
  } = useLatestCompletedCyclesByBowlIds(standbyBowlIds)

  const isFormSubmitting =
    createBowl.isPending || updateBowlName.isPending

  const listLoading = isLoading || cyclesLoading || latestLoading
  const listError = isError || cyclesError || latestError
  const listFetching = isFetching || cyclesFetching || latestFetching
  const activeCount = activeCyclesByBowlId.size

  function resolveCycleDisplay(bowl: Bowl): BowlCycleDisplay {
    const active = activeCyclesByBowlId.get(bowl.id)
    if (active) {
      return {
        status: 'active',
        detailLabel: formatExchangeElapsedLabel(active.start_time),
      }
    }

    const latest = latestCompletedByBowlId.get(bowl.id)
    if (latest?.end_time) {
      return {
        status: 'standby',
        detailLabel: formatLatestCompletedAtLabel(latest.end_time),
      }
    }

    return {
      status: 'standby',
      detailLabel: '記録なし',
    }
  }

  async function handleFormSubmit(values: BowlFormValues) {
    if (!formDialog.open) {
      return
    }

    setFormError(null)

    try {
      if (formDialog.mode === 'create') {
        await createBowl.mutateAsync(values.name)
      } else {
        await updateBowlName.mutateAsync({
          id: formDialog.bowl.id,
          name: values.name,
        })
      }
      setFormDialog({ open: false })
    } catch {
      setFormError('保存に失敗しました。もう一度お試しください。')
    }
  }

  async function handleDeactivateConfirm() {
    if (!deactivateDialog.open) {
      return
    }

    setDeactivateError(null)

    try {
      await deactivateBowl.mutateAsync(deactivateDialog.bowl.id)
      setDeactivateDialog({ open: false })
    } catch {
      setDeactivateError('削除に失敗しました。もう一度お試しください。')
    }
  }

  function handleRefetch() {
    void refetch()
    void refetchCycles()
    void refetchLatest()
  }

  return (
    <AppShell title="水皿管理">

      <div className="flex flex-col gap-4 pt-4">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#006591]">
              <GlassWater className="size-6" strokeWidth={1.75} />
            </div>
            <div className="flex min-w-0 items-baseline gap-1">
              <span className="font-heading text-xl font-semibold text-[#292524]">
                {activeCount}
              </span>
              <span className="font-heading text-base font-semibold text-[#78716C]">
                / {bowls.length}
              </span>
              <span className="truncate text-xs text-[#78716C]">
                箇所設置中
              </span>
            </div>
          </div>

          <Button
            type="button"
            className="h-10 shrink-0 gap-1 rounded-full bg-[#0EA5E9] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7]"
            onClick={() => {
              setFormError(null)
              setFormDialog({ open: true, mode: 'create' })
            }}
          >
            <Plus className="size-4" />
            水皿を追加
          </Button>
        </div>

        {listLoading ? <LoadingMessage /> : null}

        {listError ? (
          <FetchErrorMessage
            message="水皿一覧の取得に失敗しました。もう一度お試しください。"
            isRetrying={listFetching}
            onRetry={handleRefetch}
          />
        ) : null}

        {!listLoading && !listError && bowls.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
            <p className="font-heading text-base font-semibold text-[#292524]">
              水皿がまだありません
            </p>
            <p className="mt-1 text-sm text-[#78716C]">
              「水皿を追加」から最初の水皿を登録してください。
            </p>
          </div>
        ) : null}

        {!listLoading && !listError && bowls.length > 0 ? (
          <div className="flex flex-col gap-4">
            {bowls.map((bowl) => (
              <BowlListItem
                key={bowl.id}
                bowl={bowl}
                cycle={resolveCycleDisplay(bowl)}
                onEdit={(target) => {
                  setFormError(null)
                  setFormDialog({ open: true, mode: 'edit', bowl: target })
                }}
                onDeactivate={(target) => {
                  setDeactivateError(null)
                  setDeactivateDialog({ open: true, bowl: target })
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <BowlFormDialog
        open={formDialog.open}
        mode={formDialog.open ? formDialog.mode : 'create'}
        initialName={
          formDialog.open && formDialog.mode === 'edit'
            ? formDialog.bowl.name
            : ''
        }
        isSubmitting={isFormSubmitting}
        errorMessage={formError}
        onOpenChange={(open) => {
          if (!open) {
            setFormDialog({ open: false })
            setFormError(null)
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <DeactivateBowlDialog
        open={deactivateDialog.open}
        bowlName={
          deactivateDialog.open ? deactivateDialog.bowl.name : ''
        }
        isSubmitting={deactivateBowl.isPending}
        errorMessage={deactivateError}
        onOpenChange={(open) => {
          if (!open) {
            setDeactivateDialog({ open: false })
            setDeactivateError(null)
          }
        }}
        onConfirm={() => {
          void handleDeactivateConfirm()
        }}
      />
    </AppShell>
  )
}

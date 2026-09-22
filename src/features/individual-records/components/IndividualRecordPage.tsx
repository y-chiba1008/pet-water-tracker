import { useEffect, useState } from 'react'
import { IndividualRecordForm } from '@/features/individual-records/components/IndividualRecordForm'
import { useInsertIndividualRecord } from '@/features/individual-records/hooks/useIndividualRecordMutation'
import type { IndividualRecordFormValues } from '@/features/individual-records/lib/individualRecordFormSchema'
import { useAuth } from '@/features/login/hooks/useAuth'
import { AppShell } from '@/shared/components/AppShell'
import { dateTimeLocalToIso } from '@/shared/lib/dateTime'

export function IndividualRecordPage() {
  const { user } = useAuth()
  const insertRecord = useInsertIndividualRecord()

  const [formKey, setFormKey] = useState(0)
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

  async function handleSubmit(values: IndividualRecordFormValues) {
    if (!user) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    try {
      await insertRecord.mutateAsync({
        recordedAt: dateTimeLocalToIso(values.recordedAt),
        amountMl: values.amountMl,
        recordedBy: user.id,
      })
      setFormKey((key) => key + 1)
      setSuccessMessage(`飲水量 ${values.amountMl}ml を記録しました`)
    } catch {
      setFormError('保存に失敗しました。もう一度お試しください。')
    }
  }

  return (
    <AppShell title="個別給水">
      <div className="relative flex flex-col gap-4 pt-4">
        <IndividualRecordForm
          key={formKey}
          isSubmitting={insertRecord.isPending}
          errorMessage={formError}
          onSubmit={handleSubmit}
        />

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

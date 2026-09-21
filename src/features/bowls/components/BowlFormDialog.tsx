import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, X } from 'lucide-react'
import {
  bowlFormSchema,
  type BowlFormValues,
} from '@/features/bowls/lib/bowlFormSchema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type BowlFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialName?: string
  isSubmitting: boolean
  errorMessage: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: BowlFormValues) => Promise<void>
}

export function BowlFormDialog({
  open,
  mode,
  initialName = '',
  isSubmitting,
  errorMessage,
  onOpenChange,
  onSubmit,
}: BowlFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BowlFormValues>({
    resolver: zodResolver(bowlFormSchema),
    defaultValues: { name: initialName },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset({ name: initialName })
  }, [open, initialName, reset])

  const isCreate = mode === 'create'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-4 rounded-t-2xl border-0 bg-white p-4 shadow-[0_16px_36px_-6px_rgba(41,37,36,0.16)] ring-0 sm:rounded-2xl sm:max-w-lg top-auto bottom-0 translate-y-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 data-open:slide-in-from-bottom-4 sm:data-open:slide-in-from-bottom-0"
      >
        <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#E0F2FE] text-[#006591]">
              {isCreate ? (
                <Plus className="size-5" strokeWidth={2} />
              ) : (
                <Pencil className="size-4" strokeWidth={2} />
              )}
            </div>
            <DialogTitle className="font-heading text-base font-semibold text-[#292524]">
              {isCreate ? '新しい水皿を追加' : '水皿の編集'}
            </DialogTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-[#78716C] hover:bg-[#F5EFEB]"
            onClick={() => onOpenChange(false)}
          >
            <span className="sr-only">閉じる</span>
            <X className="size-5" />
          </Button>
        </DialogHeader>

        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            void handleSubmit(async (values) => {
              await onSubmit(values)
            })(event)
          }}
        >
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="bowl-name"
              className="text-xs font-semibold text-[#292524]"
            >
              水皿の名前 <span className="text-[#EA580C]">*</span>
            </Label>
            <Input
              id="bowl-name"
              autoFocus
              placeholder="例：リビング セラミックボウル"
              className="h-12 rounded-xl border-0 bg-[#F5EFEB] px-4 text-base text-[#292524] placeholder:text-[#A8A29E] focus-visible:bg-white focus-visible:ring-[#0EA5E9]/40"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name ? (
              <p className="pt-1 text-xs text-destructive" role="alert">
                {errors.name.message}
              </p>
            ) : (
              <DialogDescription className="pt-1 text-xs text-[#78716C]">
                設置場所やお皿の種類が分かりやすい名前を入力してください。
              </DialogDescription>
            )}
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-full bg-[#F5EFEB] text-base font-semibold text-[#78716C] hover:bg-[#eae1da]"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-full bg-[#0EA5E9] text-base font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7]"
            >
              {isSubmitting
                ? '保存中…'
                : isCreate
                  ? '水皿を追加する'
                  : '保存する'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type DeactivateBowlDialogProps = {
  open: boolean
  bowlName: string
  isSubmitting: boolean
  errorMessage: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeactivateBowlDialog({
  open,
  bowlName,
  isSubmitting,
  errorMessage,
  onOpenChange,
  onConfirm,
}: DeactivateBowlDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xs gap-2 rounded-2xl border-0 bg-white p-4 shadow-[0_16px_36px_-6px_rgba(41,37,36,0.16)] ring-0">
        <AlertDialogHeader className="place-items-center text-center">
          <AlertDialogMedia className="mb-1 size-12 rounded-full bg-[#ffdad6]/40 text-[#ba1a1a]">
            <Trash2 className="size-7" />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading text-base font-semibold text-[#292524]">
            水皿を削除しますか？
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-[#78716C]">
            「
            <span className="font-semibold text-[#292524]">{bowlName}</span>
            」の登録を解除します。過去の飲水量ログは保持されます。
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <p className="text-center text-sm text-destructive" role="alert">
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
            やめる
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            className="h-12 flex-1 rounded-full bg-[#ba1a1a] text-base font-semibold text-white hover:bg-[#93000a]"
            onClick={onConfirm}
          >
            {isSubmitting ? '削除中…' : '削除する'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

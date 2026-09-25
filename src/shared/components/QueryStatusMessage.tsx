import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LoadingMessageProps = {
  className?: string
}

export function LoadingMessage({ className }: LoadingMessageProps) {
  return (
    <p className={cn('py-8 text-center text-sm text-[#78716C]', className)}>
      読み込み中…
    </p>
  )
}

type FetchErrorMessageProps = {
  message: string
  isRetrying: boolean
  onRetry: () => void
  className?: string
}

export function FetchErrorMessage({
  message,
  isRetrying,
  onRetry,
  className,
}: FetchErrorMessageProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-8', className)}>
      <p className="text-center text-sm text-destructive" role="alert">
        {message}
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={isRetrying}
        onClick={onRetry}
        className="h-12 w-full rounded-full border-[#E7DFD8] bg-[#F5EFEB] text-base font-semibold text-[#78716C] hover:bg-[#eae1da]"
      >
        再読み込み
      </Button>
    </div>
  )
}

import { useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { signOut } from '@/features/login/api/authRepository'
import { useAuth } from '@/features/login/hooks/useAuth'
import { getAvatarUrl } from '@/shared/lib/getAvatarUrl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu() {
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const avatarUrl = getAvatarUrl(user)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch {
      setIsSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 overflow-hidden rounded-full p-0 hover:bg-transparent"
          aria-label="アカウントメニュー"
          disabled={isSigningOut}
        >
          <Avatar className="size-8 after:border-[#006591]/20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="" referrerPolicy="no-referrer" />
            ) : null}
            <AvatarFallback className="bg-[#006591] text-white">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-48 rounded-xl border-0 bg-[#fff8f5] p-1.5 text-[#292524] shadow-[0_8px_24px_rgba(120,113,108,0.16)] ring-1 ring-[#78716C]/10"
      >
        {user?.email ? (
          <>
            <DropdownMenuLabel className="truncate px-2.5 py-1.5 text-xs font-medium text-[#78716C]">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#78716C]/15" />
          </>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-[#ba1a1a] focus:bg-[#ffdad6] focus:text-[#93000a]"
          onSelect={() => void handleSignOut()}
        >
          <LogOut className="size-4" />
          {isSigningOut ? 'ログアウト中…' : 'ログアウト'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

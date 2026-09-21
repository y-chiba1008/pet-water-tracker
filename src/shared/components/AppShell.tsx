import { NavLink } from 'react-router'
import {
  Bath,
  Droplet,
  NotebookPen,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import logo from '@/assets/logo.png'

const navItems = [
  { to: '/', label: 'ホーム', icon: Droplet, end: true },
  {
    to: '/bowl-records',
    label: '水皿交換',
    icon: Bath,
    end: false,
    disabled: true,
  },
  {
    to: '/individual-records',
    label: '個別給水',
    icon: NotebookPen,
    end: false,
    disabled: true,
  },
  {
    to: '/bowls',
    label: '水皿管理',
    icon: SlidersHorizontal,
    end: false,
  },
] as const

type AppShellProps = {
  title: string
  children: ReactNode
  headerAction?: ReactNode
}

export function AppShell({ title, children, headerAction }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-[#FAF7F2] text-[#292524] selection:bg-[#E0F2FE] selection:text-[#006591]">
      <header className="fixed top-0 z-40 w-full bg-[#fff8f5]/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-screen-md items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={logo}
              alt=""
              className="size-8 shrink-0 rounded-full object-contain"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[11px] leading-[14px] font-medium tracking-wide text-[#78716C]">
                猫の飲水量記録
              </span>
              <h1 className="font-heading truncate text-base leading-6 font-semibold text-[#292524]">
                {title}
              </h1>
            </div>
          </div>
          {headerAction ? (
            <div className="flex shrink-0 items-center gap-2">{headerAction}</div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-screen-md flex-1 flex-col px-4 pt-16 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 z-40 w-full bg-[#fff8f5]/85 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(120,113,108,0.08)] backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-screen-md grid-cols-4 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon

            if ('disabled' in item && item.disabled) {
              return (
                <span
                  key={item.label}
                  aria-disabled
                  className="flex h-full min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 text-[#A8A29E]"
                >
                  <Icon className="size-6" strokeWidth={1.75} />
                  <span className="text-[11px] leading-[14px] font-medium tracking-wide">
                    {item.label}
                  </span>
                </span>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-full min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 transition-colors duration-150 active:scale-95',
                    isActive
                      ? 'font-semibold text-[#006591]'
                      : 'text-[#78716C]',
                  )
                }
              >
                <Icon className="size-6" strokeWidth={1.75} />
                <span className="text-[11px] leading-[14px] font-medium tracking-wide">
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

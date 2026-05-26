"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, LogOut, Menu, X, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/clientes",   label: "Clientes",   icon: Users },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
]

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <span className="text-white font-bold text-xs tracking-tight">MB</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-white">MidiaBox</p>
            <p className="text-[11px]" style={{ color: "oklch(0.5 0 0)" }}>Painel da agência</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active ? "text-white" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
              style={active ? {
                background: "oklch(0.65 0.22 283 / 15%)",
                color: "oklch(0.8 0.15 283)",
              } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 flex-shrink-0 flex-col h-screen sticky top-0 border-r border-white/[0.06]"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <span className="text-white font-bold text-[10px] tracking-tight">MB</span>
          </div>
          <span className="font-semibold text-sm text-white">MidiaBox</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative w-64 flex flex-col h-full border-r border-white/[0.06]"
            style={{ background: "oklch(0.06 0 0)" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <NavLinks onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}

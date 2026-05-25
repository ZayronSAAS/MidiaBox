"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem("sd_user")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm"
        style={{ background: "oklch(0.08 0 0 / 90%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <span className="text-white font-bold text-xs tracking-tight">MB</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-white">MidiaBox</p>
            <p className="text-[11px] text-zinc-500">Acompanhamento</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 bg-white min-h-screen">{children}</main>
    </div>
  )
}

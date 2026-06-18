"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ClientsProvider } from "@/lib/clients-context"

export default function AprovadorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <ClientsProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
            >
              <span className="text-white font-bold text-xs tracking-tight">MB</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">MidiaBox</p>
              <p className="text-[11px] text-slate-400">Aprovação de conteúdo</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </div>
    </ClientsProvider>
  )
}

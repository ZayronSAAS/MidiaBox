"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockUsers } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const user = mockUsers.find((u) => u.email === email.trim().toLowerCase())
    if (!user) {
      setError("E-mail não encontrado. Tente: ana@agencia.com, joao@cafedojoao.com ou maria@mariafit.com")
      return
    }
    localStorage.setItem("sd_user", JSON.stringify(user))
    if (user.role === "gestor") {
      router.push("/dashboard")
    } else {
      router.push("/acompanhamento")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.22 283), transparent 70%)" }} />
      </div>

      <div className="w-full max-w-sm px-4 relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.5 0.25 300))" }}>
            <span className="text-white font-bold text-xl tracking-tight">MB</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MidiaBox</h1>
          <p className="text-zinc-500 mt-1.5 text-sm">Gestão de social media</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] p-6" style={{ background: "oklch(0.12 0 0)" }}>
          <h2 className="text-base font-semibold text-white mb-1">Entrar na plataforma</h2>
          <p className="text-xs text-zinc-500 mb-5">Use seu e-mail para acessar</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-400 text-xs">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                autoComplete="email"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-400 text-xs">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                defaultValue="123456"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-950/50 border border-red-900/50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <Button type="submit" className="w-full font-semibold h-10"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
              Entrar
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] text-zinc-600 mb-2 font-medium uppercase tracking-wide">Contas demo</p>
            <div className="space-y-0.5">
              {mockUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setEmail(u.email)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between group"
                >
                  <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{u.name}</span>
                  <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

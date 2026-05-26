"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError || !data.user) {
      setError("E-mail ou senha incorretos. Verifique suas credenciais.")
      setLoading(false)
      return
    }

    const role = data.user.user_metadata?.role
    router.push(role === "gestor" ? "/dashboard" : "/acompanhamento")
    router.refresh()
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
          <p className="text-xs text-zinc-500 mb-5">Use seu e-mail e senha para acessar</p>

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
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-400 text-xs">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                autoComplete="current-password"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/50 border border-red-900/50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold h-10 gap-2"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-5">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-violet-400 hover:text-violet-300 transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

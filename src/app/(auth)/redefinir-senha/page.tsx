"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Eye, EyeOff, CheckCircle2, KeyRound } from "lucide-react"
import Link from "next/link"

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError("Link expirado ou inválido. Solicite um novo link de recuperação.")
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Glow */}
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

        {success ? (
          /* ── Sucesso ── */
          <div className="rounded-2xl border border-white/[0.08] p-6 text-center space-y-4"
            style={{ background: "oklch(0.12 0 0)" }}>
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div>
              <p className="text-base font-semibold text-white">Senha redefinida!</p>
              <p className="text-sm text-zinc-400 mt-1.5">
                Redirecionando para o login...
              </p>
            </div>
          </div>
        ) : (
          /* ── Formulário ── */
          <div className="rounded-2xl border border-white/[0.08] p-6"
            style={{ background: "oklch(0.12 0 0)" }}>
            <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-violet-400" />
              Criar nova senha
            </h2>
            <p className="text-xs text-zinc-500 mb-5">
              Escolha uma senha segura com pelo menos 6 caracteres.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Nova senha</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError("") }}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Confirmar senha</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError("") }}
                  placeholder="Repita a senha"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/50 border border-red-900/50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>

            <Link href="/recuperar-senha"
              className="block text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors mt-4">
              Solicitar novo link
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

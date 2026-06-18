"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function RecuperarSenhaPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/redefinir-senha` }
    )

    if (err) {
      setError("Não foi possível enviar o e-mail. Verifique o endereço informado.")
    } else {
      setSent(true)
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

        {sent ? (
          /* ── E-mail enviado ── */
          <div className="rounded-2xl border border-white/[0.08] p-6 text-center space-y-4"
            style={{ background: "oklch(0.12 0 0)" }}>
            <div className="flex justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">E-mail enviado!</p>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                Verifique sua caixa de entrada em <span className="text-zinc-200">{email}</span> e clique
                no link para criar uma nova senha.
              </p>
            </div>
            <p className="text-xs text-zinc-600">
              Não recebeu?{" "}
              <button
                onClick={() => setSent(false)}
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Tentar novamente
              </button>
            </p>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </Link>
          </div>
        ) : (
          /* ── Formulário ── */
          <div className="rounded-2xl border border-white/[0.08] p-6"
            style={{ background: "oklch(0.12 0 0)" }}>
            <h2 className="text-base font-semibold text-white mb-1">Recuperar senha</h2>
            <p className="text-xs text-zinc-500 mb-5">
              Informe seu e-mail e enviaremos um link para criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError("") }}
                    placeholder="seu@email.com"
                    required
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition"
                  />
                </div>
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mt-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

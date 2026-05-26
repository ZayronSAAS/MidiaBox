"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function CadastroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    if (form.password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.")
      return
    }
    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          role: "cliente",
        },
      },
    })

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "Este e-mail já está cadastrado."
          : "Erro ao criar conta. Tente novamente."
      )
      setLoading(false)
      return
    }

    // Se confirmação de e-mail está desativada, redireciona direto
    if (data.session) {
      router.push("/acompanhamento")
      router.refresh()
    } else {
      // Confirmação de e-mail ativada — mostra mensagem de sucesso
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, oklch(0.65 0.22 283), transparent 70%)" }} />
        </div>
        <div className="w-full max-w-sm px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.5 0.25 300))" }}>
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro realizado!</h1>
          <p className="text-zinc-400 text-sm mb-6">
            Enviamos um e-mail de confirmação para <span className="text-white font-medium">{form.email}</span>.
            Verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          <Link href="/login">
            <Button className="w-full font-semibold"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
              Voltar para o login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Criar conta</h1>
          <p className="text-zinc-500 mt-1.5 text-sm">Acesse o acompanhamento dos seus posts</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] p-6" style={{ background: "oklch(0.12 0 0)" }}>
          <h2 className="text-base font-semibold text-white mb-1">Suas informações</h2>
          <p className="text-xs text-zinc-500 mb-5">Preencha os dados para criar seu acesso</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Nome completo *</Label>
              <Input
                placeholder="João da Silva"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">E-mail *</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Telefone / WhatsApp *</Label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Senha *</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Confirmar senha *</Label>
              <Input
                type="password"
                placeholder="Repita a senha"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
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
              {loading ? "Criando conta..." : "Criar minha conta"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-5">
          Já tem conta?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

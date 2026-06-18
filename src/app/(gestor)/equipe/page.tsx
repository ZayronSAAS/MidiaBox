"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, UserPlus, Trash2, Eye, EyeOff, Palette, ClipboardCheck, Users2 } from "lucide-react"

interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  role: "designer" | "aprovador"
  createdAt: string
}

const roleConfig = {
  designer: {
    label: "Designer",
    desc: "Vê clientes e ideias de post (somente leitura)",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    activeCard: "border-violet-500 bg-violet-50",
    icon: Palette,
  },
  aprovador: {
    label: "Aprovador externo",
    desc: "Aprova ou reprova posts enviados para aprovação",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    activeCard: "border-blue-500 bg-blue-50",
    icon: ClipboardCheck,
  },
}

export default function EquipePage() {
  const [members, setMembers]   = useState<TeamMember[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [showPass, setShowPass] = useState(false)

  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole]         = useState<"designer" | "aprovador">("designer")

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true })
    if (data) {
      setMembers(data.map(r => ({
        id: r.id as string,
        userId: r.user_id as string,
        name: r.name as string,
        email: r.email as string,
        role: r.role as "designer" | "aprovador",
        createdAt: r.created_at as string,
      })))
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    const res = await fetch("/api/equipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? "Erro ao criar membro")
    } else {
      setSuccess(`Acesso criado! ${name} já pode entrar com o e-mail informado.`)
      setName(""); setEmail(""); setPassword("")
      fetchMembers()
    }
    setSaving(false)
  }

  async function handleRemove(member: TeamMember) {
    if (!confirm(`Remover ${member.name}? O acesso será revogado imediatamente.`)) return
    setRemoving(member.id)
    await fetch("/api/equipe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id, userId: member.userId }),
    })
    setMembers(prev => prev.filter(m => m.id !== member.id))
    setRemoving(null)
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users2 className="w-6 h-6 text-violet-500" />
          Equipe
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Crie acessos para seu designer e aprovadores externos.
        </p>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-violet-500" />
          Adicionar membro
        </h2>

        <form onSubmit={handleCreate} className="space-y-5">

          {/* Role pills */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Tipo de acesso</p>
            <div className="grid grid-cols-2 gap-3">
              {(["designer", "aprovador"] as const).map(r => {
                const cfg = roleConfig[r]
                const Icon = cfg.icon
                const active = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 text-left transition-all ${
                      active
                        ? cfg.activeCard
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${active ? "text-violet-600" : "text-slate-400"}`} />
                      <span className={`text-sm font-semibold ${active ? "text-slate-900" : "text-slate-600"}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className={`text-xs leading-snug ${active ? "text-slate-600" : "text-slate-400"}`}>
                      {cfg.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name + email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: João Designer"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="joao@exemplo.com"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Senha de acesso</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">Você define a senha — compartilhe com o funcionário depois.</p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-lg">
              ✅ {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {saving ? "Criando acesso..." : "Criar acesso"}
          </button>
        </form>
      </div>

      {/* ── Members list ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-base font-semibold text-slate-900">Membros da equipe</p>
          {!loading && members.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">{members.length} membro{members.length !== 1 ? "s" : ""} cadastrado{members.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          </div>
        ) : members.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">Nenhum membro ainda</p>
            <p className="text-slate-400 text-xs mt-0.5">Crie o primeiro acesso acima.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map(member => {
              const cfg = roleConfig[member.role]
              const Icon = cfg.icon
              return (
                <div key={member.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-violet-700">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                      <p className="text-xs text-slate-500 truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Role badge + remove */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => handleRemove(member)}
                      disabled={removing === member.id}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover acesso"
                    >
                      {removing === member.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

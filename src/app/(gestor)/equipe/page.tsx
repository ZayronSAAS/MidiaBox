"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2, Loader2, Palette, ClipboardCheck, Eye, EyeOff } from "lucide-react"

interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  role: "designer" | "aprovador"
  createdAt: string
}

const roleConfig = {
  designer:  { label: "Designer",          color: "bg-violet-100 text-violet-700",  icon: Palette },
  aprovador: { label: "Aprovador externo", color: "bg-blue-100 text-blue-700",     icon: ClipboardCheck },
}

export default function EquipePage() {
  const [members, setMembers]   = useState<TeamMember[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [showPass, setShowPass] = useState(false)

  // Form state
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole]         = useState<"designer" | "aprovador">("designer")

  useEffect(() => {
    fetchMembers()
  }, [])

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
      setSuccess(`Conta criada! ${name} já pode fazer login com o e-mail informado.`)
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
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Equipe</h1>
        <p className="text-slate-500 mt-0.5 text-sm">
          Crie acessos para o seu designer e aprovadores externos
        </p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-violet-500" />
          Adicionar membro
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-1.5">
            <Label>Tipo de acesso</Label>
            <div className="flex gap-3">
              {(["designer", "aprovador"] as const).map(r => {
                const cfg = roleConfig[r]
                const Icon = cfg.icon
                const active = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      active
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: João Designer"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="joao@exemplo.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Senha de acesso</Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              ✅ {success}
            </p>
          )}

          <Button
            type="submit"
            disabled={saving}
            className="gap-2"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {saving ? "Criando..." : "Criar acesso"}
          </Button>
        </form>
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Membros da equipe</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          </div>
        ) : members.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">
            Nenhum membro cadastrado ainda.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map(member => {
              const cfg = roleConfig[member.role]
              const Icon = cfg.icon
              return (
                <div key={member.id} className="px-6 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-600">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => handleRemove(member)}
                      disabled={removing === member.id}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

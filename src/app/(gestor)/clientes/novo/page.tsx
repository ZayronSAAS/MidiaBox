"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useClients } from "@/lib/clients-context"
import { SocialNetworkEditor } from "@/components/gestor/social-network-editor"
import { SocialNetwork } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, ImageIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#6F4E37", "#E91E63", "#2E7D32", "#1565C0", "#6A1B9A",
  "#E65100", "#37474F", "#00695C", "#6366f1", "#0891b2",
]

const NICHE_PRESETS = [
  "Farmácia", "Saúde", "Beleza", "Fitness", "Varejo",
  "Clínica", "Restaurante", "Moda", "Educação",
]

// ─── Page ─────────────────────────────────────────────────────────
export default function NovoClientePage() {
  const router = useRouter()
  const { addClient } = useClients()

  // Basic info
  const [name, setName] = useState("")
  const [logo, setLogo] = useState<string | undefined>()
  const [color, setColor] = useState(COLOR_PRESETS[8])

  // Niche multi-select
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [showOtherNiche, setShowOtherNiche] = useState(false)
  const [otherNiche, setOtherNiche] = useState("")

  // Other fields
  const [toneOfVoice, setToneOfVoice] = useState("")
  const [briefing, setBriefing] = useState("")
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([])

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // ── Logo upload ────────────────────────────────────────────────
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogo(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // ── Niche helpers ──────────────────────────────────────────────
  function toggleNiche(n: string) {
    setSelectedNiches((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    )
  }

  function toggleOther() {
    setShowOtherNiche((v) => {
      if (v) setOtherNiche("")
      return !v
    })
  }

  function getNicheValue() {
    const all = [...selectedNiches]
    if (showOtherNiche && otherNiche.trim()) all.push(otherNiche.trim())
    return all.join(", ")
  }

  // ── Save ───────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")
    const newClient = await addClient({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
      niche: getNicheValue(),
      logo,
      toneOfVoice,
      briefing,
      color,
      socialNetworks,
    })
    if (newClient) {
      router.push(`/clientes/${newClient.id}`)
    } else {
      setError("Erro ao criar o cliente. Tente novamente.")
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/clientes">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Novo cliente</h1>
          <p className="text-slate-500 text-sm mt-0.5">Preencha os dados do cliente</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">

        {/* ── LOGO ── */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Logo do cliente</Label>
          <div className="flex items-center gap-4">
            {/* Preview */}
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-50">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-1">
                  <ImageIcon className="w-5 h-5 text-slate-300 mx-auto" />
                  <p className="text-[9px] text-slate-300 mt-0.5 leading-tight">sem logo</p>
                </div>
              )}
            </div>
            {/* Controls */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors w-fit">
                <Upload className="w-3.5 h-3.5" />
                {logo ? "Trocar logo" : "Enviar logo"}
                <input type="file" accept=".png,.jpg,.jpeg,.svg,image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              {logo && (
                <button type="button" onClick={() => setLogo(undefined)}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors w-fit">
                  <X className="w-3.5 h-3.5" />
                  Remover logo
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed ml-1">PNG, JPG ou SVG<br />Máx. 2 MB</p>
          </div>
        </div>

        {/* ── NOME ── */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Nome do cliente *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Café do João" required
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50" />
        </div>

        {/* ── NICHO (tags) ── */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 font-medium">Nicho / Segmento</Label>
          <div className="flex gap-1.5 flex-wrap">
            {NICHE_PRESETS.map((n) => (
              <button key={n} type="button" onClick={() => toggleNiche(n)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                  selectedNiches.includes(n)
                    ? "text-white border-transparent"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
                style={selectedNiches.includes(n) ? { backgroundColor: color, borderColor: color } : {}}
              >
                {n}
              </button>
            ))}
            <button type="button" onClick={toggleOther}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                showOtherNiche
                  ? "bg-slate-800 text-white border-slate-800"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}>
              Outro
            </button>
          </div>
          {showOtherNiche && (
            <Input value={otherNiche} onChange={(e) => setOtherNiche(e.target.value)}
              placeholder="Digite o nicho personalizado..."
              className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50 text-sm mt-1" />
          )}
        </div>

        {/* ── COR ── */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 font-medium">Cor do cliente</Label>
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white" />
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                  style={{ backgroundColor: c, borderColor: color === c ? "#7c3aed" : "transparent", outline: color === c ? "2px solid #ede9fe" : "none" }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── TOM DE VOZ ── */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Tom de voz</Label>
          <Input value={toneOfVoice} onChange={(e) => setToneOfVoice(e.target.value)}
            placeholder="Ex: Descontraído e próximo"
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50" />
        </div>

        {/* ── BRIEFING ── */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Briefing</Label>
          <Textarea value={briefing} onChange={(e) => setBriefing(e.target.value)}
            placeholder="Descreva o negócio, público-alvo, diferenciais..."
            rows={3} className="resize-none border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50" />
        </div>

        {/* ── REDES SOCIAIS ── */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 font-medium">Redes sociais</Label>
          <SocialNetworkEditor value={socialNetworks} onChange={setSocialNetworks} />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={!name.trim() || saving} className="flex-1 gap-2 font-semibold"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Criando...</> : "Criar cliente"}
          </Button>
          <Link href="/clientes">
            <Button type="button" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

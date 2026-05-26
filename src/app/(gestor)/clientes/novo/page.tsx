"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useClients } from "@/lib/clients-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"

const colors = ["#6F4E37", "#E91E63", "#2E7D32", "#1565C0", "#6A1B9A", "#E65100", "#37474F", "#00695C", "#6366f1", "#0891b2"]
const niches = ["Gastronomia", "Fitness & Saúde", "Tecnologia", "Moda & Beleza", "Educação", "Imóveis", "Varejo", "Serviços", "Outro"]

export default function NovoClientePage() {
  const router = useRouter()
  const { addClient } = useClients()

  const [name, setName] = useState("")
  const [niche, setNiche] = useState("")
  const [toneOfVoice, setToneOfVoice] = useState("")
  const [briefing, setBriefing] = useState("")
  const [color, setColor] = useState(colors[0])
  const [igHandle, setIgHandle] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")
    const newClient = await addClient({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
      niche,
      toneOfVoice,
      briefing,
      color,
      socialNetworks: igHandle.trim()
        ? [{ platform: "instagram" as const, handle: igHandle.trim() }]
        : [],
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

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {/* Nome */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Nome do cliente *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Café do João"
            required
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
          />
        </div>

        {/* Nicho */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 font-medium">Nicho / Segmento</Label>
          <div className="flex gap-2 flex-wrap">
            {niches.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNiche(n)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  niche === n
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Cor */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 font-medium">Cor do cliente</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
            />
            <div className="flex gap-1.5 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#7c3aed" : "transparent",
                    outline: color === c ? "2px solid #ede9fe" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tom de voz */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Tom de voz</Label>
          <Input
            value={toneOfVoice}
            onChange={(e) => setToneOfVoice(e.target.value)}
            placeholder="Ex: Descontraído e próximo"
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
          />
        </div>

        {/* Briefing */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Briefing</Label>
          <Textarea
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            placeholder="Descreva o negócio, público-alvo, diferenciais..."
            rows={3}
            className="resize-none border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 font-medium">Instagram</Label>
          <Input
            value={igHandle}
            onChange={(e) => setIgHandle(e.target.value)}
            placeholder="@handle"
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={!name.trim() || saving}
            className="flex-1 gap-2 font-semibold"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar cliente"
            )}
          </Button>
          <Link href="/clientes">
            <Button type="button" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

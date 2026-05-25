"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

const colors = ["#6F4E37", "#E91E63", "#2E7D32", "#1565C0", "#6A1B9A", "#E65100", "#37474F", "#00695C"]
const niches = ["Gastronomia", "Fitness & Saúde", "Tecnologia", "Moda & Beleza", "Educação", "Imóveis", "Varejo", "Serviços", "Outro"]

export default function NovoClientePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [niche, setNiche] = useState("")
  const [toneOfVoice, setToneOfVoice] = useState("")
  const [briefing, setBriefing] = useState("")
  const [color, setColor] = useState(colors[0])
  const [igHandle, setIgHandle] = useState("")

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    router.push("/clientes")
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/clientes">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo cliente</h1>
          <p className="text-slate-500 mt-1">Preencha os dados do cliente</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Nome do cliente *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Café do João"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Nicho</Label>
              <div className="flex gap-2 flex-wrap">
                {niches.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNiche(n)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      niche === n
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cor da identidade</Label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg transition-transform ${color === c ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tom de voz</Label>
              <Input
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                placeholder="Ex: Descontraído e próximo"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Briefing</Label>
              <Textarea
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="Descreva o negócio, público-alvo, diferenciais..."
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Instagram</Label>
              <Input
                value={igHandle}
                onChange={(e) => setIgHandle(e.target.value)}
                placeholder="@handle"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">Criar cliente</Button>
              <Link href="/clientes">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

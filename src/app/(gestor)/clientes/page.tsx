"use client"

import Link from "next/link"
import { mockClients, mockPosts } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowRight, Globe } from "lucide-react"

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Globe className="w-3.5 h-3.5" />,
  linkedin: <Globe className="w-3.5 h-3.5" />,
  tiktok: <Globe className="w-3.5 h-3.5" />,
  facebook: <Globe className="w-3.5 h-3.5" />,
  twitter: <Globe className="w-3.5 h-3.5" />,
  youtube: <Globe className="w-3.5 h-3.5" />,
}

export default function ClientesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clientes</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{mockClients.length} clientes ativos</p>
        </div>
        <Link href="/clientes/novo">
          <Button className="gap-2 font-medium h-9"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <Plus className="w-4 h-4" />
            Novo cliente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {mockClients.map((client) => {
          const posts = mockPosts.filter((p) => p.clientId === client.id)
          const pending = posts.filter((p) => p.status === "aprovacao").length
          const published = posts.filter((p) => p.status === "publicado").length
          return (
            <Link key={client.id} href={`/clientes/${client.id}`}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base"
                    style={{ backgroundColor: client.color }}
                  >
                    {client.name.charAt(0)}
                  </div>
                  {pending > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {pending} pendente{pending > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-slate-900">{client.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{client.niche}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {client.socialNetworks.map((sn) => (
                    <span key={sn.platform}
                      className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md truncate max-w-[130px]">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{sn.handle}</span>
                    </span>
                  ))}
                </div>

                <div className="flex gap-5 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Publicados</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{published}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Total posts</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{posts.length}</p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

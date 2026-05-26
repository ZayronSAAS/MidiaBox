"use client"

import Link from "next/link"
import { mockPosts } from "@/lib/mock-data"
import { useClients } from "@/lib/clients-context"
import { Button } from "@/components/ui/button"
import { Plus, Globe } from "lucide-react"

export default function ClientesPage() {
  const { clients } = useClients()

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Clientes</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{clients.length} clientes ativos</p>
        </div>
        <Link href="/clientes/novo">
          <Button className="gap-2 font-medium h-9"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo cliente</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Link>
      </div>

      {clients.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-medium text-slate-500 mb-1">Nenhum cliente cadastrado</p>
          <p className="text-sm">Clique em "Novo cliente" para começar.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {clients.map((client) => {
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

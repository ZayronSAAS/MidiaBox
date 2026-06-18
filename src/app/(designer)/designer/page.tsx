"use client"

import Link from "next/link"
import { useClients } from "@/lib/clients-context"
import { ClientAvatar } from "@/components/gestor/client-avatar"
import { ArrowRight, Loader2, Lightbulb } from "lucide-react"

export default function DesignerClientsPage() {
  const { clients, loading } = useClients()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Selecione um cliente para ver as ideias de post
        </p>
      </div>

      {/* Grid */}
      {clients.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/designer/${client.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:border-violet-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <ClientAvatar name={client.name} color={client.color} logo={client.logo} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{client.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{client.niche || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-violet-600 ml-3 flex-shrink-0">
                <Lightbulb className="w-3.5 h-3.5" />
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

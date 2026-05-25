"use client"

import Link from "next/link"
import { mockClients, mockPosts } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { statusConfig } from "@/lib/utils"
import { Users, FileText, Clock, CheckCircle, Plus, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function DashboardPage() {
  const totalPosts = mockPosts.length
  const pendingApproval = mockPosts.filter((p) => p.status === "aprovacao").length
  const scheduled = mockPosts.filter((p) => p.status === "agendado").length
  const published = mockPosts.filter((p) => p.status === "publicado").length

  const recentPosts = [...mockPosts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  function getClientName(clientId: string) {
    return mockClients.find((c) => c.id === clientId)?.name ?? "—"
  }

  const stats = [
    { label: "Clientes",           value: mockClients.length, icon: Users,       color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Total de posts",     value: totalPosts,         icon: FileText,    color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Aguard. aprovação",  value: pendingApproval,    icon: Clock,       color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Publicados",         value: published,          icon: CheckCircle, color: "text-green-600",  bg: "bg-green-50"  },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-0.5 capitalize text-sm">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Link href="/clientes/novo">
          <Button className="gap-2 font-medium h-9"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <Plus className="w-4 h-4" />
            Novo cliente
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-2">{label}</p>
                <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Posts recentes */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Posts recentes</p>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPosts.map((post) => (
              <div key={post.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{getClientName(post.clientId)}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[post.status].color}`}>
                    {statusConfig[post.status].label}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {format(new Date(post.scheduledAt), "dd/MM")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Clientes</p>
          </div>
          <div className="divide-y divide-slate-100">
            {mockClients.map((client) => {
              const clientPosts = mockPosts.filter((p) => p.clientId === client.id)
              const pending = clientPosts.filter((p) => p.status === "aprovacao").length
              return (
                <Link
                  key={client.id}
                  href={`/clientes/${client.id}`}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: client.color }}
                    >
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.niche}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pending > 0 && (
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] flex items-center justify-center font-bold">
                        {pending}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useClients } from "@/lib/clients-context"
import { getAllPosts } from "@/lib/posts-service"
import { Post } from "@/types"
import { Button } from "@/components/ui/button"
import { statusConfig } from "@/lib/utils"
import { Users, FileText, Clock, CheckCircle, Plus, ArrowRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function DashboardPage() {
  const { clients, loading: clientsLoading } = useClients()
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getAllPosts()
      setPosts(data)
      setPostsLoading(false)
    }
    load()
  }, [])

  const loading = clientsLoading || postsLoading

  const totalPosts = posts.length
  const pendingApproval = posts.filter((p) => p.status === "aprovacao").length
  const published = posts.filter((p) => p.status === "publicado").length

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  function getClientName(clientId: string) {
    return clients.find((c) => c.id === clientId)?.name ?? "—"
  }

  const stats = [
    { label: "Clientes",          value: clients.length, icon: Users,       color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Total de posts",    value: totalPosts,     icon: FileText,    color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Aguard. aprovação", value: pendingApproval, icon: Clock,      color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Publicados",        value: published,       icon: CheckCircle, color: "text-green-600", bg: "bg-green-50"  },
  ]

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-0.5 capitalize text-sm">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-2">{label}</p>
                {loading ? (
                  <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Posts recentes */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Posts recentes</p>
          </div>
          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">
              Nenhum post cadastrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/clientes/${post.clientId}`}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
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
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Clientes</p>
          </div>
          {clientsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            </div>
          ) : clients.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-slate-400 mb-3">Nenhum cliente ainda.</p>
              <Link href="/clientes/novo">
                <Button size="sm" className="gap-1.5 text-xs"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar cliente
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {clients.map((client) => {
                const clientPosts = posts.filter((p) => p.clientId === client.id)
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
                        <p className="text-xs text-slate-500">{client.niche || "—"}</p>
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
          )}
        </div>
      </div>
    </div>
  )
}

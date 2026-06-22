"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useClients } from "@/lib/clients-context"
import { createClient } from "@/lib/supabase/client"
import { getTasks } from "@/lib/tasks-service"
import { Post, Task } from "@/types"
import { TasksWidget } from "@/components/gestor/dashboard/tasks-widget"
import { UpcomingPosts } from "@/components/gestor/dashboard/upcoming-posts"
import { DesignerNotifications } from "@/components/gestor/dashboard/designer-notifications"
import { Button } from "@/components/ui/button"
import { statusConfig, networkConfig } from "@/lib/utils"
import {
  Plus, Loader2, ArrowRight, FileText,
  Clock, CheckCircle2, Calendar, Users,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const _now      = new Date()
const TODAY_STR = format(_now, "yyyy-MM-dd")

// Busca apenas as colunas necessárias para o dashboard (sem attachments/comments/logo)
async function getDashboardPosts(): Promise<Post[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("posts")
    .select(
      "id, client_id, title, network, status, scheduled_at, format, designer_done, designer_done_at, updated_at, created_at, caption, hashtags, image_url"
    )
    .order("scheduled_at", { ascending: true })
  return (data ?? []).map(r => ({
    id: r.id as string,
    clientId: r.client_id as string,
    title: r.title as string,
    caption: (r.caption as string) ?? "",
    network: r.network as Post["network"],
    status: r.status as Post["status"],
    scheduledAt: r.scheduled_at as string,
    imageUrl: (r.image_url as string) ?? undefined,
    hashtags: (r.hashtags as string[]) ?? [],
    comments: [],
    attachments: [],
    format: (r.format as Post["format"]) ?? "foto",
    designerDone: (r.designer_done as boolean) ?? false,
    designerDoneAt: (r.designer_done_at as string) ?? undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }))
}

export default function DashboardPage() {
  const { clients, loading: clientsLoading } = useClients()

  const [posts,       setPosts]       = useState<Post[]>([])
  const [tasks,       setTasks]       = useState<Task[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const loadData = useCallback(async () => {
    setDataLoading(true)
    const [postsData, tasksData] = await Promise.all([
      getDashboardPosts(),
      getTasks(TODAY_STR),
    ])
    setPosts(postsData)
    setTasks(tasksData)
    setDataLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const loading = clientsLoading || dataLoading

  // Contadores rápidos
  const counts = {
    ideia:     posts.filter(p => p.status === "ideia").length,
    aprovacao: posts.filter(p => p.status === "aprovacao").length,
    agendado:  posts.filter(p => p.status === "agendado").length,
    publicado: posts.filter(p => p.status === "publicado").length,
  }

  const upcomingPosts = posts
    .filter(p => p.status === "agendado")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5)

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-0.5 capitalize text-sm">
            {format(_now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
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

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : (
        <>
          {/* Notificações do designer — destaque principal */}
          <DesignerNotifications
            posts={posts}
            clientNames={Object.fromEntries(clients.map(c => [c.id, c.name]))}
          />

          {/* Contadores rápidos por status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "ideia",     label: "Ideias",       icon: FileText,     color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200" },
              { key: "aprovacao", label: "Aprovação",    icon: Clock,        color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200" },
              { key: "agendado",  label: "Agendados",    icon: Calendar,     color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200" },
              { key: "publicado", label: "Publicados",   icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200" },
            ].map(({ key, label, icon: Icon, color, bg, border }) => (
              <Link key={key} href="/clientes" className={`rounded-xl border ${border} ${bg} p-4 flex items-center gap-3 hover:shadow-sm transition-shadow`}>
                <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                <div>
                  <p className={`text-2xl font-bold ${color}`}>{counts[key as keyof typeof counts]}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Clientes ativos */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-violet-500 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-violet-600">{clients.length}</p>
              <p className="text-xs text-slate-500">Cliente{clients.length !== 1 ? "s" : ""} ativo{clients.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Linha: Tarefas + Próximas publicações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TasksWidget
              tasks={tasks}
              clients={clients}
              today={TODAY_STR}
              onTasksChange={setTasks}
            />

            {/* Próximas publicações agendadas */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-semibold text-slate-900">Próximas publicações</p>
              </div>
              {upcomingPosts.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-xs">
                  Nenhum post agendado.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingPosts.map(post => {
                    const client = clients.find(c => c.id === post.clientId)
                    return (
                      <Link
                        key={post.id}
                        href={`/clientes/${post.clientId}`}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${networkConfig[post.network].color}`}>
                              {networkConfig[post.network].label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {client?.name ?? "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-400 tabular-nums">
                            {format(new Date(post.scheduledAt), "dd/MM")}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

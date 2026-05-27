"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useClients } from "@/lib/clients-context"
import { getAllPosts } from "@/lib/posts-service"
import { getTasks } from "@/lib/tasks-service"
import { getMetrics } from "@/lib/metrics-service"
import { Post, Task, ClientMetric } from "@/types"
import { KpiCards } from "@/components/gestor/dashboard/kpi-cards"
import { ClientHealthCards } from "@/components/gestor/dashboard/client-health-cards"
import { AlertsPanel } from "@/components/gestor/dashboard/alerts-panel"
import { FormatDonut } from "@/components/gestor/dashboard/format-donut"
import { TasksWidget } from "@/components/gestor/dashboard/tasks-widget"
import { UpcomingPosts } from "@/components/gestor/dashboard/upcoming-posts"
import { ClientAvatar } from "@/components/gestor/client-avatar"
import { Button } from "@/components/ui/button"
import { statusConfig } from "@/lib/utils"
import { Plus, Loader2, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// ── Constants computed once at module load ────────────────────────────────────
const _now         = new Date()
const CURRENT_MONTH = _now.getMonth() + 1
const CURRENT_YEAR  = _now.getFullYear()
const PREV_MONTH    = CURRENT_MONTH === 1 ? 12 : CURRENT_MONTH - 1
const PREV_YEAR     = CURRENT_MONTH === 1 ? CURRENT_YEAR - 1 : CURRENT_YEAR
const TODAY_STR     = format(_now, "yyyy-MM-dd")

function lastNMonths(n: number): { month: number; year: number }[] {
  const result: { month: number; year: number }[] = []
  const d = new Date(_now)
  for (let i = 0; i < n; i++) {
    result.unshift({ month: d.getMonth() + 1, year: d.getFullYear() })
    d.setMonth(d.getMonth() - 1)
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { clients, loading: clientsLoading } = useClients()

  const [posts,       setPosts]       = useState<Post[]>([])
  const [tasks,       setTasks]       = useState<Task[]>([])
  const [metrics,     setMetrics]     = useState<ClientMetric[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const loadData = useCallback(async () => {
    setDataLoading(true)
    const periods = lastNMonths(7)
    const months  = [...new Set(periods.map(p => p.month))]
    const years   = [...new Set(periods.map(p => p.year))]

    const [postsData, tasksData, metricsData] = await Promise.all([
      getAllPosts(),
      getTasks(TODAY_STR),
      getMetrics({ months, years }),
    ])
    setPosts(postsData)
    setTasks(tasksData)
    setMetrics(metricsData)
    setDataLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const loading = clientsLoading || dataLoading

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentMetrics = metrics.filter(
    m => m.month === CURRENT_MONTH && m.year === CURRENT_YEAR
  )
  const prevMetrics = metrics.filter(
    m => m.month === PREV_MONTH && m.year === PREV_YEAR
  )
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-12">

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
          {/* 1 ── KPIs */}
          <KpiCards
            clients={clients}
            posts={posts}
            currentMonth={CURRENT_MONTH}
            currentYear={CURRENT_YEAR}
            currentMetrics={currentMetrics}
            prevMetrics={prevMetrics}
          />

          {/* 2 ── Desempenho por cliente */}
          {clients.length > 0 && (
            <ClientHealthCards
              clients={clients}
              posts={posts}
              currentMonth={CURRENT_MONTH}
              currentYear={CURRENT_YEAR}
              metrics={metrics}
            />
          )}

          {/* 3 ── Alertas inteligentes */}
          <AlertsPanel clients={clients} posts={posts} />

          {/* 4 ── Linha inferior: donut · tarefas · próximas publicações */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormatDonut
              posts={posts}
              currentMonth={CURRENT_MONTH}
              currentYear={CURRENT_YEAR}
            />
            <TasksWidget
              tasks={tasks}
              clients={clients}
              today={TODAY_STR}
              onTasksChange={setTasks}
            />
            <UpcomingPosts posts={posts} clients={clients} />
          </div>

          {/* 5 ── Posts recentes (mantido) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">Posts recentes</p>
            </div>
            {recentPosts.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">
                Nenhum post cadastrado ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPosts.map(post => {
                  const client = clients.find(c => c.id === post.clientId)
                  return (
                    <Link
                      key={post.id}
                      href={`/clientes/${post.clientId}`}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {client && (
                          <ClientAvatar name={client.name} color={client.color} logo={client.logo} size="sm" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {clients.find(c => c.id === post.clientId)?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[post.status].color}`}>
                          {statusConfig[post.status].label}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums hidden sm:block">
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
        </>
      )}
    </div>
  )
}

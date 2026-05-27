"use client"

import { Client, Post, ClientMetric } from "@/types"
import { ClientAvatar } from "@/components/gestor/client-avatar"
import Link from "next/link"

interface ClientHealthCardsProps {
  clients: Client[]
  posts: Post[]
  currentMonth: number
  currentYear: number
  metrics: ClientMetric[]   // last 6 months, all clients
}

function isSameMonth(dateStr: string, month: number, year: number) {
  const d = new Date(dateStr)
  return d.getMonth() + 1 === month && d.getFullYear() === year
}

/** Simple horizontal bar, 0–100 */
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

/** Mini bar sparkline — values is an array of numbers */
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-0.5 h-6">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-violet-200"
          style={{ height: `${Math.max((v / max) * 100, 4)}%` }}
        />
      ))}
    </div>
  )
}

type HealthStatus = "saudavel" | "atencao" | "critico" | "sem-meta"

function healthLabel(status: HealthStatus) {
  const map = {
    saudavel:  { label: "Saudável",  classes: "bg-emerald-100 text-emerald-700" },
    atencao:   { label: "Atenção",   classes: "bg-yellow-100 text-yellow-700" },
    critico:   { label: "Crítico",   classes: "bg-red-100 text-red-600" },
    "sem-meta":{ label: "Sem meta",  classes: "bg-slate-100 text-slate-500" },
  }
  return map[status]
}

function computeHealth(pubPct: number, postsPerWeek: number): HealthStatus {
  if (!postsPerWeek) return "sem-meta"
  if (pubPct >= 80) return "saudavel"
  if (pubPct >= 50) return "atencao"
  return "critico"
}

export function ClientHealthCards({
  clients, posts, currentMonth, currentYear, metrics,
}: ClientHealthCardsProps) {
  if (clients.length === 0) return null

  // Build a lookup: clientId → sorted list of last-6-month metrics (oldest → newest)
  const metricsByClient: Record<string, ClientMetric[]> = {}
  for (const m of metrics) {
    if (!metricsByClient[m.clientId]) metricsByClient[m.clientId] = []
    metricsByClient[m.clientId].push(m)
  }
  // Sort each client's metrics chronologically
  for (const id of Object.keys(metricsByClient)) {
    metricsByClient[id].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month
    )
  }

  return (
    <div>
      <p className="text-sm font-semibold text-slate-900 mb-3">Desempenho por cliente</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clients.map((client) => {
          const ppw = client.postsPerWeek ?? 4
          const planned = ppw * 4
          const published = posts.filter(
            p => p.clientId === client.id && p.status === "publicado" && isSameMonth(p.createdAt, currentMonth, currentYear)
          ).length
          const pubPct = planned > 0 ? Math.round((published / planned) * 100) : 0

          const status = computeHealth(pubPct, ppw)
          const { label: hLabel, classes: hClass } = healthLabel(status)

          const clientMetrics = metricsByClient[client.id] ?? []
          const currentM = clientMetrics.find(m => m.month === currentMonth && m.year === currentYear)
          const sparkValues = clientMetrics.slice(-6).map(m => m.reach)
          // Pad to 6 entries if needed
          while (sparkValues.length < 6) sparkValues.unshift(0)

          const instagramHandle = client.socialNetworks.find(s => s.platform === "instagram")?.handle

          return (
            <Link key={client.id} href={`/clientes/${client.id}`}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <ClientAvatar name={client.name} color={client.color} logo={client.logo} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{client.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {client.niche || "—"}{instagramHandle ? ` · @${instagramHandle}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${hClass}`}>
                    {hLabel}
                  </span>
                </div>

                {/* Progress bars */}
                <div className="space-y-2.5 mb-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-slate-500">Posts publicados</span>
                      <span className="text-[11px] font-medium text-slate-700">{published}/{planned}</span>
                    </div>
                    <ProgressBar pct={pubPct}
                      color={pubPct >= 80 ? "bg-emerald-500" : pubPct >= 50 ? "bg-yellow-400" : "bg-red-400"} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-slate-500">Taxa de engajamento</span>
                      <span className="text-[11px] font-medium text-slate-700">
                        {currentM ? `${currentM.engagementRate}%` : "—"}
                      </span>
                    </div>
                    <ProgressBar pct={currentM ? Math.min(currentM.engagementRate * 20, 100) : 0} color="bg-pink-400" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-slate-500">Crescimento de seguidores</span>
                      <span className="text-[11px] font-medium text-slate-700">
                        {currentM ? `${currentM.followerGrowth > 0 ? "+" : ""}${currentM.followerGrowth}%` : "—"}
                      </span>
                    </div>
                    <ProgressBar pct={currentM ? Math.min(Math.abs(currentM.followerGrowth) * 10, 100) : 0} color="bg-sky-400" />
                  </div>
                </div>

                {/* Sparkline */}
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">Alcance — últimos 6 meses</p>
                  <Sparkline values={sparkValues} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

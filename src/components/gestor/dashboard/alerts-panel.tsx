"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Client, Post } from "@/types"
import { AlertCircle, AlertTriangle, Calendar, CheckCircle2 } from "lucide-react"
import { differenceInHours, isWithinInterval, addDays, startOfWeek } from "date-fns"

interface AlertsPanelProps {
  clients: Client[]
  posts: Post[]
}

type AlertLevel = "red" | "orange" | "blue"

interface Alert {
  id: string
  level: AlertLevel
  text: string
  clientName: string
  clientId: string
  actionLabel: string
  actionHref: string
}

// ── Fixed + calculated holidays (2025–2026) ──────────────────────────────────
const HOLIDAYS: Array<{ name: string; date: Date }> = [
  { name: "Dia da Mulher",   date: new Date(2025, 2, 8) },
  { name: "Carnaval",        date: new Date(2025, 2, 3) },
  { name: "Páscoa",          date: new Date(2025, 3, 20) },
  { name: "Dia das Mães",    date: new Date(2025, 4, 11) },
  { name: "Dia dos Pais",    date: new Date(2025, 7, 10) },
  { name: "Dia do Cliente",  date: new Date(2025, 8, 15) },
  { name: "Natal",           date: new Date(2025, 11, 25) },
  { name: "Ano Novo",        date: new Date(2026, 0, 1) },
  { name: "Dia da Mulher",   date: new Date(2026, 2, 8) },
  { name: "Carnaval",        date: new Date(2026, 1, 16) },
  { name: "Páscoa",          date: new Date(2026, 3, 5) },
  { name: "Dia das Mães",    date: new Date(2026, 4, 10) },
  { name: "Dia dos Pais",    date: new Date(2026, 7, 9) },
  { name: "Dia do Cliente",  date: new Date(2026, 8, 15) },
  { name: "Natal",           date: new Date(2026, 11, 25) },
  { name: "Ano Novo",        date: new Date(2027, 0, 1) },
]

const LEVEL_STYLES: Record<AlertLevel, { bg: string; border: string; icon: string }> = {
  red:    { bg: "bg-red-50",    border: "border-red-200",    icon: "text-red-500" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-500" },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-500" },
}

function AlertIcon({ level, className }: { level: AlertLevel; className?: string }) {
  if (level === "red")    return <AlertCircle    className={className} />
  if (level === "orange") return <AlertTriangle  className={className} />
  return                         <Calendar       className={className} />
}

export function AlertsPanel({ clients, posts }: AlertsPanelProps) {
  const alerts = useMemo<Alert[]>(() => {
    const now = new Date()
    const result: Alert[] = []

    // ── RED: posts awaiting approval > 48 h ──────────────────────────────
    const staleApprovals = posts.filter(
      p => p.status === "aprovacao" && differenceInHours(now, new Date(p.createdAt)) > 48
    )
    for (const p of staleApprovals) {
      const client = clients.find(c => c.id === p.clientId)
      if (!client) continue
      result.push({
        id: `stale-${p.id}`,
        level: "red",
        text: `"${p.title}" aguarda aprovação há mais de 48h`,
        clientName: client.name,
        clientId: client.id,
        actionLabel: "Ver posts",
        actionHref: `/clientes/${client.id}`,
      })
    }

    // ── ORANGE: client below weekly frequency ─────────────────────────────
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    for (const client of clients) {
      const ppw = client.postsPerWeek ?? 4
      if (!ppw) continue
      const postedThisWeek = posts.filter(p =>
        p.clientId === client.id &&
        p.status !== "ideia" &&
        new Date(p.createdAt) >= weekStart
      ).length
      if (postedThisWeek < ppw) {
        result.push({
          id: `freq-${client.id}`,
          level: "orange",
          text: `Frequência abaixo do contrato esta semana (${postedThisWeek}/${ppw})`,
          clientName: client.name,
          clientId: client.id,
          actionLabel: "Criar post",
          actionHref: `/clientes/${client.id}`,
        })
      }
    }

    // ── BLUE: holiday in next 15 days without a planned post ──────────────
    const in15 = addDays(now, 15)
    const upcomingHolidays = HOLIDAYS.filter(h =>
      isWithinInterval(h.date, { start: now, end: in15 })
    )
    for (const holiday of upcomingHolidays) {
      // Check if ANY client has a post scheduled around ±2 days of the holiday
      const hasCoverage = (clientId: string) =>
        posts.some(p => {
          if (p.clientId !== clientId) return false
          if (p.status === "ideia" || p.status === "reprovado") return false
          const diff = Math.abs(
            new Date(p.scheduledAt).getTime() - holiday.date.getTime()
          )
          return diff <= 2 * 24 * 60 * 60 * 1000
        })

      for (const client of clients) {
        if (!hasCoverage(client.id)) {
          result.push({
            id: `holiday-${holiday.name}-${client.id}`,
            level: "blue",
            text: `${holiday.name} em ${holiday.date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} sem post planejado`,
            clientName: client.name,
            clientId: client.id,
            actionLabel: "Planejar",
            actionHref: `/clientes/${client.id}`,
          })
        }
      }
    }

    return result.slice(0, 12) // cap at 12 alerts
  }, [clients, posts])

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">Alertas inteligentes</p>
        {alerts.length > 0 && (
          <span className="text-[11px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="px-5 py-10 flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          <p className="text-sm font-medium text-slate-700">Tudo em dia!</p>
          <p className="text-xs text-slate-400">Nenhuma pendência no momento.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {alerts.map(alert => {
            const style = LEVEL_STYLES[alert.level]
            return (
              <div key={alert.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${style.bg}`}>
                  <AlertIcon level={alert.level} className={`w-3.5 h-3.5 ${style.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{alert.clientName}</p>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5">{alert.text}</p>
                </div>
                <Link href={alert.actionHref}
                  className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${style.bg} ${style.border} ${style.icon} hover:opacity-80`}>
                  {alert.actionLabel}
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

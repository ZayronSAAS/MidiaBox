"use client"

import { Client, Post, ClientMetric } from "@/types"
import { Users, FileText, Clock, CheckCircle, TrendingUp, Radio } from "lucide-react"

interface KpiCardsProps {
  clients: Client[]
  posts: Post[]
  currentMonth: number
  currentYear: number
  currentMetrics: ClientMetric[]
  prevMetrics: ClientMetric[]
}

function isSameMonth(dateStr: string, month: number, year: number) {
  const d = new Date(dateStr)
  return d.getMonth() + 1 === month && d.getFullYear() === year
}

function delta(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 100)
}

function DeltaBadge({ curr, prev }: { curr: number; prev: number }) {
  if (prev === 0 && curr === 0) return null
  const d = delta(curr, prev)
  if (d === 0) return <span className="text-xs text-slate-400 font-medium">= mesmo período</span>
  const up = d > 0
  return (
    <span className={`text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? "▲" : "▼"} {Math.abs(d)}% vs. mês anterior
    </span>
  )
}

export function KpiCards({ clients, posts, currentMonth, currentYear, currentMetrics, prevMetrics }: KpiCardsProps) {
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  // Posts this month vs last month
  const postsThisMonth  = posts.filter(p => isSameMonth(p.createdAt, currentMonth, currentYear)).length
  const postsLastMonth  = posts.filter(p => isSameMonth(p.createdAt, prevMonth, prevYear)).length

  // Pending approval
  const pending = posts.filter(p => p.status === "aprovacao").length

  // Published this month vs last month
  const pubThisMonth = posts.filter(p => p.status === "publicado" && isSameMonth(p.createdAt, currentMonth, currentYear)).length
  const pubLastMonth = posts.filter(p => p.status === "publicado" && isSameMonth(p.createdAt, prevMonth, prevYear)).length

  // Planned this month (non-ideia posts created this month)
  const plannedThisMonth = posts.filter(p => p.status !== "ideia" && isSameMonth(p.createdAt, currentMonth, currentYear)).length
  const pubPct = plannedThisMonth > 0 ? Math.round((pubThisMonth / plannedThisMonth) * 100) : null

  // New clients this month
  const newClientsThisMonth = clients.filter(c => isSameMonth(c.createdAt, currentMonth, currentYear)).length

  // Metrics aggregates
  const sumCurrReach = currentMetrics.reduce((s, m) => s + m.reach, 0)
  const sumPrevReach = prevMetrics.reduce((s, m) => s + m.reach, 0)
  const hasMetrics = currentMetrics.length > 0

  const sumCurrEng = hasMetrics
    ? parseFloat((currentMetrics.reduce((s, m) => s + m.engagementRate, 0) / currentMetrics.length).toFixed(1))
    : 0
  const sumPrevEng = prevMetrics.length > 0
    ? parseFloat((prevMetrics.reduce((s, m) => s + m.engagementRate, 0) / prevMetrics.length).toFixed(1))
    : 0

  const cards = [
    {
      label: "Clientes ativos",
      value: clients.length,
      sub: newClientsThisMonth > 0 ? `+${newClientsThisMonth} este mês` : "sem novos este mês",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      delta: null as null | { curr: number; prev: number },
    },
    {
      label: "Posts este mês",
      value: postsThisMonth,
      sub: null,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      delta: { curr: postsThisMonth, prev: postsLastMonth },
    },
    {
      label: "Aguard. aprovação",
      value: pending,
      sub: pending > 0 ? "requer atenção" : "tudo aprovado",
      icon: Clock,
      color: pending > 0 ? "text-orange-600" : "text-slate-400",
      bg: pending > 0 ? "bg-orange-50" : "bg-slate-50",
      delta: null,
    },
    {
      label: "Publicados",
      value: pubThisMonth,
      sub: pubPct !== null ? `${pubPct}% do planejado` : null,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      delta: { curr: pubThisMonth, prev: pubLastMonth },
    },
    {
      label: "Engajamento médio",
      value: hasMetrics ? `${sumCurrEng}%` : "—",
      sub: hasMetrics ? null : "sem métricas ainda",
      icon: TrendingUp,
      color: "text-pink-600",
      bg: "bg-pink-50",
      delta: hasMetrics ? { curr: sumCurrEng, prev: sumPrevEng } : null,
    },
    {
      label: "Alcance total",
      value: hasMetrics ? sumCurrReach.toLocaleString("pt-BR") : "—",
      sub: hasMetrics ? null : "sem métricas ainda",
      icon: Radio,
      color: "text-sky-600",
      bg: "bg-sky-50",
      delta: hasMetrics ? { curr: sumCurrReach, prev: sumPrevReach } : null,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(({ label, value, sub, icon: Icon, color, bg, delta: d }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium leading-snug">{label}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
            {d ? (
              <DeltaBadge curr={d.curr} prev={d.prev} />
            ) : sub ? (
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

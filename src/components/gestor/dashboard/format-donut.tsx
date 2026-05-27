"use client"

import { Post, PostFormat } from "@/types"

interface FormatDonutProps {
  posts: Post[]
  currentMonth: number
  currentYear: number
}

const FORMAT_CONFIG: Record<PostFormat, { label: string; color: string }> = {
  reels:     { label: "Reels",     color: "#a78bfa" },
  carrossel: { label: "Carrossel", color: "#60a5fa" },
  foto:      { label: "Foto",      color: "#34d399" },
  stories:   { label: "Stories",   color: "#fb923c" },
}

function isSameMonth(dateStr: string, month: number, year: number) {
  const d = new Date(dateStr)
  return d.getMonth() + 1 === month && d.getFullYear() === year
}

/** Pure SVG donut — no external library */
function Donut({ slices }: { slices: { pct: number; color: string; label: string }[] }) {
  const filtered = slices.filter(s => s.pct > 0)
  if (filtered.length === 0) return (
    <svg viewBox="0 0 104 104" width="96" height="96">
      <circle cx="52" cy="52" r="40" fill="none" stroke="#e2e8f0" strokeWidth="16" />
      <circle cx="52" cy="52" r="40" fill="none" stroke="#f8fafc" strokeWidth="2" />
    </svg>
  )

  const cx = 52, cy = 52, R = 40, r = 24
  let cumAngle = -Math.PI / 2

  const paths = filtered.map(s => {
    const angle = (s.pct / 100) * 2 * Math.PI
    // Guard against full-circle slice (100%)
    const end = cumAngle + (angle >= 2 * Math.PI ? 2 * Math.PI - 0.0001 : angle)
    const largeArc = angle > Math.PI ? 1 : 0
    const ox1 = cx + R * Math.cos(cumAngle), oy1 = cy + R * Math.sin(cumAngle)
    const ox2 = cx + R * Math.cos(end),      oy2 = cy + R * Math.sin(end)
    const ix1 = cx + r * Math.cos(end),      iy1 = cy + r * Math.sin(end)
    const ix2 = cx + r * Math.cos(cumAngle), iy2 = cy + r * Math.sin(cumAngle)
    const d = `M${ox1.toFixed(2)},${oy1.toFixed(2)} A${R},${R} 0 ${largeArc},1 ${ox2.toFixed(2)},${oy2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${r},${r} 0 ${largeArc},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z`
    cumAngle = end
    return { d, color: s.color, label: s.label }
  })

  return (
    <svg viewBox="0 0 104 104" width="96" height="96">
      {paths.map(p => <path key={p.label} d={p.d} fill={p.color} />)}
    </svg>
  )
}

export function FormatDonut({ posts, currentMonth, currentYear }: FormatDonutProps) {
  const published = posts.filter(
    p => p.status === "publicado" && isSameMonth(p.createdAt, currentMonth, currentYear)
  )

  const counts: Record<PostFormat, number> = { reels: 0, carrossel: 0, foto: 0, stories: 0 }
  for (const p of published) {
    const f = p.format ?? "foto"
    counts[f]++
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0)

  const slices = (Object.entries(counts) as [PostFormat, number][]).map(([f, count]) => ({
    label: FORMAT_CONFIG[f].label,
    color: FORMAT_CONFIG[f].color,
    count,
    pct: total > 0 ? Math.round((count / total) * 100) : 0,
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
      <p className="text-sm font-semibold text-slate-900 mb-4">Mix de formatos</p>
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="w-16 h-16 rounded-full border-8 border-slate-100" />
          <p className="text-xs text-slate-400">Nenhum post publicado ainda</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Donut slices={slices.map(s => ({ pct: s.pct, color: s.color, label: s.label }))} />
          <div className="space-y-2 flex-1">
            {slices.filter(s => s.count > 0).map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600 flex-1">{s.label}</span>
                <span className="text-xs font-semibold text-slate-700">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

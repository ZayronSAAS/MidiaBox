"use client"

import { useState, useEffect } from "react"
import { getAllPosts } from "@/lib/posts-service"
import { useClients } from "@/lib/clients-context"
import { Post } from "@/types"
import { statusConfig, networkConfig } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function CalendarioPage() {
  const { clients } = useClients()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [filterClientId, setFilterClientId] = useState<string>("all")
  const [allPostsData, setAllPostsData] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getAllPosts()
      setAllPostsData(data)
      setPostsLoading(false)
    }
    load()
  }, [])

  const allPosts = filterClientId === "all"
    ? allPostsData
    : allPostsData.filter((p) => p.clientId === filterClientId)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  })

  function getClientColor(clientId: string) {
    return clients.find((c) => c.id === clientId)?.color ?? "#6366f1"
  }

  function getClientName(clientId: string) {
    return clients.find((c) => c.id === clientId)?.name ?? "—"
  }

  function getPostsForDay(day: Date) {
    return allPosts.filter((p) => isSameDay(new Date(p.scheduledAt), day))
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Calendário</h1>
          <p className="text-slate-500 text-sm mt-0.5">Todos os posts agendados</p>
        </div>

        {/* Client filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterClientId("all")}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
              filterClientId === "all"
                ? "bg-violet-600 text-white border-violet-600"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Todos
          </button>
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterClientId(c.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                filterClientId === c.id
                  ? "text-white border-transparent"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
              style={filterClientId === c.id ? { backgroundColor: c.color, borderColor: c.color } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {postsLoading && (
          <div className="flex items-center justify-center gap-2 py-3 border-b border-slate-100 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Carregando posts...
          </div>
        )}
        {/* Nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 capitalize">
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())}
              className="px-2.5 h-7 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              Hoje
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-7 border-b border-slate-100">
            {weekDays.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wide">{d}</div>
            ))}
          </div>

          <div className="min-w-[600px] grid grid-cols-7">
            {days.map((day, i) => {
              const dayPosts = getPostsForDay(day)
              const inMonth = isSameMonth(day, currentMonth)
              const today = isToday(day)

              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[96px] p-2 border-b border-r border-slate-100",
                    !inMonth && "bg-slate-50/60",
                    i % 7 === 6 && "border-r-0"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1.5",
                    today ? "text-white font-bold" : inMonth ? "text-slate-600" : "text-slate-300"
                  )}
                    style={today ? { background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" } : {}}>
                    {format(day, "d")}
                  </span>

                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post) => (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="w-full text-left text-[11px] px-2 py-0.5 rounded-md truncate font-medium hover:opacity-75 transition-opacity flex items-center gap-1"
                        style={{ backgroundColor: `${getClientColor(post.clientId)}20`, color: getClientColor(post.clientId) }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getClientColor(post.clientId) }} />
                        {post.title}
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-[11px] text-slate-400 px-1">+{dayPosts.length - 3}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {clients.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.color }} />
            {c.name}
          </div>
        ))}
      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-md bg-white text-slate-900 border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-base">{selectedPost.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getClientColor(selectedPost.clientId) }} />
                  <span className="text-xs text-slate-600 font-medium">{getClientName(selectedPost.clientId)}</span>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConfig[selectedPost.status].color)}>
                  {statusConfig[selectedPost.status].label}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", networkConfig[selectedPost.network].color)}>
                  {networkConfig[selectedPost.network].label}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {format(new Date(selectedPost.scheduledAt), "dd/MM/yyyy 'às' HH:mm")}
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPost.caption}</p>
                {selectedPost.hashtags?.length > 0 && (
                  <p className="text-sm text-violet-600 mt-2">{selectedPost.hashtags.join(" ")}</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

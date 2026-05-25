"use client"

import { useState } from "react"
import { Post } from "@/types"
import { statusConfig, networkConfig, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from "date-fns"
import { ptBR } from "date-fns/locale"

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

interface CalendarProps {
  posts: Post[]
  onPostClick: (post: Post) => void
  onDayClick: (date: Date) => void
}

export function Calendar({ posts, onPostClick, onDayClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function getPostsForDay(day: Date) {
    return posts.filter((p) => isSameDay(new Date(p.scheduledAt), day))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
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

      {/* Week days */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {weekDays.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayPosts = getPostsForDay(day)
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)

          return (
            <div
              key={i}
              onClick={() => inMonth && onDayClick(day)}
              className={cn(
                "min-h-[96px] p-2 border-b border-r border-slate-100 transition-colors",
                inMonth ? "cursor-pointer hover:bg-slate-50" : "bg-slate-50/60",
                i % 7 === 6 && "border-r-0",
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  today ? "text-white font-bold" : inMonth ? "text-slate-600" : "text-slate-300"
                )}
                  style={today ? { background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" } : {}}>
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <button
                    key={post.id}
                    onClick={(e) => { e.stopPropagation(); onPostClick(post) }}
                    className={cn(
                      "w-full text-left text-[11px] px-2 py-0.5 rounded-md truncate font-medium transition-opacity hover:opacity-75",
                      statusConfig[post.status].color
                    )}
                  >
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
  )
}

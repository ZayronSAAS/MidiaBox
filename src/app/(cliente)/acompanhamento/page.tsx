"use client"

import { useState, useEffect } from "react"
import { mockClients, mockPosts } from "@/lib/mock-data"
import { Post, User } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { statusConfig, networkConfig } from "@/lib/utils"
import { CheckCircle, XCircle, MessageCircle, Calendar, TrendingUp } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function AcompanhamentoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [client, setClient] = useState(mockClients[0])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comment, setComment] = useState("")
  const currentMonth = new Date()

  useEffect(() => {
    const stored = localStorage.getItem("sd_user")
    if (stored) {
      const u: User = JSON.parse(stored)
      setUser(u)
      const clientMap: Record<string, string> = {
        "joao@cafedojoao.com": "c1",
        "maria@mariafit.com": "c2",
      }
      const cId = clientMap[u.email] ?? "c1"
      const foundClient = mockClients.find((c) => c.id === cId) ?? mockClients[0]
      setClient(foundClient)
      setPosts(mockPosts.filter((p) => p.clientId === cId))
    }
  }, [])

  const published = posts.filter((p) => p.status === "publicado").length
  const scheduled = posts.filter((p) => p.status === "agendado").length
  const pending = posts.filter((p) => p.status === "aprovacao").length
  const total = posts.length
  const progress = total > 0 ? Math.round((published / total) * 100) : 0

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  })

  function getPostsForDay(day: Date) {
    return posts.filter((p) => isSameDay(new Date(p.scheduledAt), day))
  }

  function handleApprove(postId: string) {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, status: "agendado" as const, updatedAt: new Date().toISOString() } : p
    ))
    setSelectedPost(null)
  }

  function handleReject(postId: string) {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, status: "reprovado" as const, updatedAt: new Date().toISOString() } : p
    ))
    setSelectedPost(null)
  }

  function handleComment(postId: string) {
    if (!comment.trim() || !user) return
    setPosts((prev) => prev.map((p) =>
      p.id === postId
        ? {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c${Date.now()}`,
                postId,
                authorId: user.id,
                authorName: user.name,
                authorRole: "cliente" as const,
                content: comment,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : p
    ))
    setComment("")
  }

  return (
    <div>
      {/* Header do cliente */}
      <div className="flex items-center gap-4 mb-7">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: client.color }}
        >
          {client.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{client.name}</h1>
          <p className="text-slate-500 text-sm capitalize">Acompanhamento — {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-7">
        {[
          { label: "Publicados",          value: published,       icon: CheckCircle,   color: "text-green-600",  bg: "bg-green-50" },
          { label: "Agendados",           value: scheduled,       icon: Calendar,      color: "text-blue-600",   bg: "bg-blue-50"  },
          { label: "Aguard. aprovação",   value: pending,         icon: MessageCircle, color: "text-orange-500", bg: "bg-orange-50"},
          { label: "Progresso do mês",    value: `${progress}%`, icon: TrendingUp,    color: "text-violet-600", bg: "bg-violet-50"},
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-2">{label}</p>
                <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pendentes de aprovação */}
      {pending > 0 && (
        <div className="mb-7">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Aguardando sua aprovação</h2>
          <div className="space-y-2">
            {posts.filter((p) => p.status === "aprovacao").map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-orange-100/70 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{post.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5 max-w-lg truncate">{post.caption}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${networkConfig[post.network].color}`}>
                    {networkConfig[post.network].label}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); handleApprove(post.id) }}
                    className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors h-8 flex items-center">
                    Aprovar
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleReject(post.id) }}
                    className="text-xs font-semibold bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors h-8 flex items-center">
                    Reprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-slate-900 mb-4 capitalize">
        Calendário — {format(currentMonth, "MMMM", { locale: ptBR })}
      </h2>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <div className="min-w-[560px] grid grid-cols-7 border-b border-slate-100">
          {weekDays.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wide">{d}</div>
          ))}
        </div>
        <div className="min-w-[560px] grid grid-cols-7">
          {calDays.map((day, i) => {
            const dayPosts = getPostsForDay(day)
            const inMonth = isSameMonth(day, currentMonth)
            const today = isToday(day)
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[90px] p-2 border-b border-r border-slate-100",
                  !inMonth && "bg-slate-50/60",
                  i % 7 === 6 && "border-r-0"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1",
                  today ? "text-white font-bold" : inMonth ? "text-slate-600" : "text-slate-300"
                )}
                  style={today ? { background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" } : {}}>
                  {format(day, "d")}
                </span>
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={cn(
                        "w-full text-left text-[11px] px-2 py-0.5 rounded-md truncate font-medium hover:opacity-75 transition-opacity",
                        statusConfig[post.status].color
                      )}
                    >
                      {post.title}
                    </button>
                  ))}
                  {dayPosts.length > 2 && (
                    <p className="text-[11px] text-slate-400 px-1">+{dayPosts.length - 2}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-900">{selectedPost.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[selectedPost.status].color}`}>
                  {statusConfig[selectedPost.status].label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${networkConfig[selectedPost.network].color}`}>
                  {networkConfig[selectedPost.network].label}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedPost.caption}</p>
                {selectedPost.hashtags?.length > 0 && (
                  <p className="text-sm text-violet-600 mt-2">{selectedPost.hashtags.join(" ")}</p>
                )}
              </div>

              <p className="text-xs text-slate-400">
                {format(new Date(selectedPost.scheduledAt), "dd/MM/yyyy 'às' HH:mm")}
              </p>

              {selectedPost.comments && selectedPost.comments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Comentários</p>
                  {selectedPost.comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{c.authorName}</span>
                        <span className="text-xs text-slate-400">{format(new Date(c.createdAt), "dd/MM")}</span>
                      </div>
                      <p className="text-sm text-slate-600">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  placeholder="Deixe um comentário ou sugestão..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleComment(selectedPost.id)}
                  disabled={!comment.trim()}
                  className="w-full"
                >
                  Enviar comentário
                </Button>
              </div>

              {selectedPost.status === "aprovacao" && (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    onClick={() => handleApprove(selectedPost.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedPost.id)}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reprovar
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

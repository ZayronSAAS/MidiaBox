"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useClients } from "@/lib/clients-context"
import { updatePost } from "@/lib/posts-service"
import { ClientAvatar } from "@/components/gestor/client-avatar"
import { networkConfig } from "@/lib/utils"
import type { Post, PostComment } from "@/types"
import {
  CheckCircle2, XCircle, Loader2, ClipboardList, ChevronDown, ChevronUp,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const formatLabels: Record<string, string> = {
  foto:      "📷 Foto",
  reels:     "🎬 Reels",
  carrossel: "🖼️ Carrossel",
  stories:   "⚡ Stories",
}

export default function AprovadorPage() {
  const { clients } = useClients()
  const [posts, setPosts]    = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing]  = useState<string | null>(null)   // postId being acted on
  const [rejectOpen, setRejectOpen] = useState<string | null>(null) // postId with open reject field
  const [rejectTexts, setRejectTexts] = useState<Record<string, string>>({})
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "aprovacao")
      .order("created_at", { ascending: true })

    if (data) {
      setPosts(data.map(row => ({
        id: row.id as string,
        clientId: row.client_id as string,
        title: row.title as string,
        caption: (row.caption as string) ?? "",
        network: row.network as Post["network"],
        status: row.status as Post["status"],
        scheduledAt: row.scheduled_at as string,
        format: (row.format as Post["format"]) ?? "foto",
        hashtags: (row.hashtags as string[]) ?? [],
        comments: (row.comments as PostComment[]) ?? [],
        attachments: [],
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPosts()
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          name: (data.user.user_metadata?.name as string) || "Aprovador",
        })
      }
    })
  }, [loadPosts])

  async function handleApprove(post: Post) {
    setActing(post.id)
    await updatePost(post.id, { status: "agendado" })
    setPosts(prev => prev.filter(p => p.id !== post.id))
    setActing(null)
  }

  async function handleReject(post: Post) {
    if (!currentUser) return
    setActing(post.id)
    const reason = rejectTexts[post.id]?.trim() ?? ""
    const newComment: PostComment = {
      id: crypto.randomUUID(),
      postId: post.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: "aprovador",
      content: reason || "Post reprovado.",
      createdAt: new Date().toISOString(),
    }
    await updatePost(post.id, {
      status: "reprovado",
      comments: [...post.comments, newComment],
    })
    setPosts(prev => prev.filter(p => p.id !== post.id))
    setActing(null)
    setRejectOpen(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Posts aguardando aprovação</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Revise cada post e aprove ou reprove com um comentário
        </p>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Tudo em dia!</p>
          <p className="text-slate-400 text-sm mt-1">Nenhum post aguardando aprovação no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const client = clients.find(c => c.id === post.clientId)
            const isActing = acting === post.id
            const isRejectOpen = rejectOpen === post.id

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 space-y-3">
                  {/* Client + network */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {client && (
                        <ClientAvatar name={client.name} color={client.color} logo={client.logo} size="sm" />
                      )}
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {client?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${networkConfig[post.network].color}`}>
                        {networkConfig[post.network].label}
                      </span>
                      {post.format && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {formatLabels[post.format]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-slate-900">{post.title}</p>

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                  )}

                  {/* Hashtags */}
                  {post.hashtags?.length > 0 && (
                    <p className="text-xs text-blue-500">{post.hashtags.join(" ")}</p>
                  )}

                  {/* Scheduled */}
                  <p className="text-xs text-slate-400">
                    Agendado para{" "}
                    <span className="text-slate-600 font-medium">
                      {format(new Date(post.scheduledAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </p>
                </div>

                {/* Reject comment area */}
                {isRejectOpen && (
                  <div className="px-5 pb-3 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500 mb-2">Motivo da reprovação (opcional):</p>
                    <Textarea
                      rows={3}
                      placeholder="Ex: A legenda não está de acordo com o tom de voz da marca..."
                      value={rejectTexts[post.id] ?? ""}
                      onChange={e => setRejectTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="text-sm resize-none"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50">
                  {/* Approve */}
                  <Button
                    size="sm"
                    disabled={isActing || isRejectOpen}
                    onClick={() => handleApprove(post)}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isActing && acting === post.id && !isRejectOpen ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Aprovar
                  </Button>

                  {/* Reject toggle / confirm */}
                  {!isRejectOpen ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActing}
                      onClick={() => setRejectOpen(post.id)}
                      className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reprovar
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        disabled={isActing}
                        onClick={() => handleReject(post)}
                        className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isActing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Confirmar reprovação
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setRejectOpen(null); setRejectTexts(prev => ({ ...prev, [post.id]: "" })) }}
                        className="text-slate-500"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

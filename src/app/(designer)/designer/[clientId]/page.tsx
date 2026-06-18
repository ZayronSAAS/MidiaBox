"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useClients } from "@/lib/clients-context"
import { getPostsByClient } from "@/lib/posts-service"
import { ClientAvatar } from "@/components/gestor/client-avatar"
import { PostDetailModal } from "@/components/designer/post-detail-modal"
import { networkConfig } from "@/lib/utils"
import type { Post } from "@/types"
import { ArrowLeft, Loader2, Lightbulb, MessageSquare, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const formatLabels: Record<string, string> = {
  foto:      "📷 Foto",
  reels:     "🎬 Reels",
  carrossel: "🖼️ Carrossel",
  stories:   "⚡ Stories",
}

export default function DesignerClientPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const { clients, loading: clientsLoading } = useClients()
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const client = clients.find(c => c.id === clientId)

  useEffect(() => {
    if (!clientId) return
    setLoading(true)
    getPostsByClient(clientId).then(all => {
      setPosts(all.filter(p => p.status === "ideia"))
      setLoading(false)
    })
  }, [clientId])

  const handlePostUpdated = useCallback((updated: Post) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
    setSelectedPost(updated)
  }, [])

  const isLoading = clientsLoading || loading

  return (
    <>
      <div className="space-y-6">
        {/* Back */}
        <Link href="/designer" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Todos os clientes
        </Link>

        {/* Client header */}
        {client && (
          <div className="flex items-center gap-4">
            <ClientAvatar name={client.name} color={client.color} logo={client.logo} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{client.niche || "—"}</p>
            </div>
          </div>
        )}

        {/* Section title */}
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-900">Ideias de post</h2>
          {!isLoading && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {posts.length}
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Nenhuma ideia cadastrada</p>
            <p className="text-slate-400 text-xs mt-1">As ideias criadas pelo gestor aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-left hover:border-violet-300 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${networkConfig[post.network].color}`}>
                    {networkConfig[post.network].label}
                  </span>
                  {post.format && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                      {formatLabels[post.format] ?? post.format}
                    </span>
                  )}
                </div>

                {/* Thumbnail */}
                {post.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-100 bg-slate-50 h-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Title */}
                <p className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-violet-700 transition-colors">
                  {post.title}
                </p>

                {/* Caption */}
                {post.caption && (
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{post.caption}</p>
                )}

                {/* Meta row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    {format(new Date(post.scheduledAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <div className="flex items-center gap-3 text-slate-400">
                    {post.comments.length > 0 && (
                      <span className="flex items-center gap-1 text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.comments.length}
                      </span>
                    )}
                    {(post.attachments ?? []).length > 0 && (
                      <span className="flex items-center gap-1 text-xs">
                        <Paperclip className="w-3.5 h-3.5" />
                        {(post.attachments ?? []).length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Click hint */}
                <p className="text-[11px] text-violet-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                  Clique para ver detalhes →
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </>
  )
}

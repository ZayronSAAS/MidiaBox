"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { updatePost } from "@/lib/posts-service"
import { networkConfig } from "@/lib/utils"
import type { Post, PostAttachment, PostComment } from "@/types"
import {
  X,
  Link2,
  FileText,
  Send,
  Loader2,
  ImageOff,
  Calendar,
  Hash,
  MessageSquare,
  Paperclip,
  ExternalLink,
  PlusCircle,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PostDetailModalProps {
  post: Post
  onClose: () => void
  onPostUpdated: (updated: Post) => void
}

const formatLabels: Record<string, string> = {
  foto:      "📷 Foto",
  reels:     "🎬 Reels",
  carrossel: "🖼️ Carrossel",
  stories:   "⚡ Stories",
}

type AttachmentTab = "link" | "note"

export function PostDetailModal({ post, onClose, onPostUpdated }: PostDetailModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Comment state
  const [commentText, setCommentText]   = useState("")
  const [sendingComment, setSendingComment] = useState(false)

  // Attachment state
  const [attachTab, setAttachTab]       = useState<AttachmentTab>("note")
  const [attachContent, setAttachContent] = useState("")
  const [attachName, setAttachName]     = useState("")
  const [savingAttach, setSavingAttach] = useState(false)

  const [currentPost, setCurrentPost]   = useState<Post>(post)

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  async function getCurrentUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    setSendingComment(true)
    const user = await getCurrentUser()
    const newComment: PostComment = {
      id: crypto.randomUUID(),
      postId: currentPost.id,
      authorId: user?.id ?? "unknown",
      authorName: user?.user_metadata?.name ?? "Designer",
      authorRole: "designer",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    }
    const updatedComments = [...currentPost.comments, newComment]
    await updatePost(currentPost.id, { comments: updatedComments })
    const updated = { ...currentPost, comments: updatedComments }
    setCurrentPost(updated)
    onPostUpdated(updated)
    setCommentText("")
    setSendingComment(false)
  }

  async function handleAddAttachment() {
    if (!attachContent.trim()) return
    setSavingAttach(true)
    const newAttachment: PostAttachment = {
      id: crypto.randomUUID(),
      type: attachTab,
      content: attachContent.trim(),
      name: attachName.trim() || undefined,
    }
    const updatedAttachments = [...(currentPost.attachments ?? []), newAttachment]
    await updatePost(currentPost.id, { attachments: updatedAttachments })
    const updated = { ...currentPost, attachments: updatedAttachments }
    setCurrentPost(updated)
    onPostUpdated(updated)
    setAttachContent("")
    setAttachName("")
    setSavingAttach(false)
  }

  const netCfg = networkConfig[currentPost.network]

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${netCfg.color}`}>
                {netCfg.label}
              </span>
              {currentPost.format && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                  {formatLabels[currentPost.format] ?? currentPost.format}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{currentPost.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Image */}
          {currentPost.imageUrl ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPost.imageUrl}
                alt={currentPost.title}
                className="w-full object-contain max-h-72"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <ImageOff className="w-5 h-5 text-slate-300" />
              <span className="text-sm text-slate-400">Nenhuma imagem anexada</span>
            </div>
          )}

          {/* Caption */}
          {currentPost.caption && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Legenda</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentPost.caption}</p>
            </div>
          )}

          {/* Hashtags */}
          {currentPost.hashtags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> Hashtags
              </p>
              <p className="text-sm text-blue-500 leading-relaxed">{currentPost.hashtags.join(" ")}</p>
            </div>
          )}

          {/* Scheduled date */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              Agendado para{" "}
              <span className="font-medium text-slate-700">
                {format(new Date(currentPost.scheduledAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </span>
          </div>

          {/* ── Attachments ── */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> Anexos
            </p>

            {/* Existing attachments */}
            {(currentPost.attachments ?? []).length > 0 ? (
              <div className="space-y-2 mb-4">
                {(currentPost.attachments ?? []).map(att => (
                  <div key={att.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    {att.type === "link" ? (
                      <Link2 className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      {att.name && (
                        <p className="text-xs font-semibold text-slate-700 mb-0.5">{att.name}</p>
                      )}
                      {att.type === "link" ? (
                        <a
                          href={att.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-violet-600 hover:underline break-all flex items-center gap-1"
                        >
                          {att.content}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{att.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-4">Nenhum anexo ainda.</p>
            )}

            {/* Add attachment */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setAttachTab("note")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                    attachTab === "note"
                      ? "bg-white text-slate-800 border-b-2 border-violet-500"
                      : "bg-slate-50 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Observação
                </button>
                <button
                  onClick={() => setAttachTab("link")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                    attachTab === "link"
                      ? "bg-white text-slate-800 border-b-2 border-violet-500"
                      : "bg-slate-50 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" /> Link
                </button>
              </div>

              <div className="p-3 space-y-2">
                <input
                  type="text"
                  value={attachName}
                  onChange={e => setAttachName(e.target.value)}
                  placeholder="Nome / título (opcional)"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
                {attachTab === "note" ? (
                  <textarea
                    value={attachContent}
                    onChange={e => setAttachContent(e.target.value)}
                    placeholder="Escreva sua observação aqui..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
                  />
                ) : (
                  <input
                    type="url"
                    value={attachContent}
                    onChange={e => setAttachContent(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                )}
                <button
                  onClick={handleAddAttachment}
                  disabled={savingAttach || !attachContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
                >
                  {savingAttach ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  {savingAttach ? "Salvando..." : "Adicionar anexo"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Comments ── */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Comentários
            </p>

            {/* Existing comments */}
            {currentPost.comments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {currentPost.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-violet-700">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-800">{comment.authorName}</span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(comment.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-4">Nenhum comentário ainda. Seja o primeiro!</p>
            )}

            {/* Add comment */}
            <div className="flex gap-2">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
                placeholder="Adicione um comentário ou observação... (Enter para enviar)"
                rows={2}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
              />
              <button
                onClick={handleAddComment}
                disabled={sendingComment || !commentText.trim()}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg text-white transition-opacity disabled:opacity-50 self-end"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
              >
                {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

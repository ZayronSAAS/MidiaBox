"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { updatePost } from "@/lib/posts-service"
import { networkConfig } from "@/lib/utils"
import type { Post, PostAttachment, PostComment } from "@/types"
import {
  X, Link2, FileText, Send, Loader2, ImageOff,
  Calendar, Hash, MessageSquare, Paperclip,
  ExternalLink, PlusCircle, ImagePlus, Upload,
  CheckCircle2, CircleCheck, Download,
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

type AttachmentTab = "note" | "link" | "image"

export function PostDetailModal({ post, onClose, onPostUpdated }: PostDetailModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [commentText, setCommentText]       = useState("")
  const [sendingComment, setSendingComment] = useState(false)
  const [markingDone, setMarkingDone]       = useState(false)

  const [attachTab, setAttachTab]           = useState<AttachmentTab>("note")
  const [attachContent, setAttachContent]   = useState("")
  const [attachName, setAttachName]         = useState("")
  const [imagePreview, setImagePreview]     = useState<string | null>(null)
  const [savingAttach, setSavingAttach]     = useState(false)

  const [currentPost, setCurrentPost]       = useState<Post>(post)

  function downloadAttachment(content: string, name?: string) {
    const a = document.createElement("a")
    a.href = content
    a.download = name ?? "imagem.jpg"
    a.click()
  }

  // Última imagem enviada como anexo (admin ou designer)
  const lastImageAttachment = [...(currentPost.attachments ?? [])]
    .reverse()
    .find(a => a.type === "image")

  // Imagem principal: imageUrl do post OU última imagem de anexo
  const heroImage = currentPost.imageUrl ?? lastImageAttachment?.content ?? null

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Limpa preview ao trocar de aba
  useEffect(() => {
    setAttachContent("")
    setAttachName("")
    setImagePreview(null)
  }, [attachTab])

  async function getCurrentUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo 5 MB.")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setAttachContent(base64)
      setImagePreview(base64)
      if (!attachName) setAttachName(file.name)
    }
    reader.readAsDataURL(file)
  }

  async function handleAddAttachment() {
    if (!attachContent.trim()) return
    setSavingAttach(true)
    const newAttachment: PostAttachment = {
      id: crypto.randomUUID(),
      type: attachTab,
      content: attachContent,
      name: attachName.trim() || undefined,
    }
    const updatedAttachments = [...(currentPost.attachments ?? []), newAttachment]
    await updatePost(currentPost.id, { attachments: updatedAttachments })
    const updated = { ...currentPost, attachments: updatedAttachments }
    setCurrentPost(updated)
    onPostUpdated(updated)
    setAttachContent("")
    setAttachName("")
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    setSavingAttach(false)
  }

  async function handleMarkDone() {
    if (currentPost.designerDone) return
    setMarkingDone(true)
    const user = await getCurrentUser()
    const doneAt = new Date().toISOString()

    // Adiciona comentário de sistema
    const systemComment: PostComment = {
      id: crypto.randomUUID(),
      postId: currentPost.id,
      authorId: user?.id ?? "unknown",
      authorName: user?.user_metadata?.name ?? "Designer",
      authorRole: "designer",
      content: "✅ Trabalho concluído pelo designer.",
      createdAt: doneAt,
    }
    const updatedComments = [...currentPost.comments, systemComment]

    await updatePost(currentPost.id, {
      designerDone: true,
      designerDoneAt: doneAt,
      status: "aprovacao",
      comments: updatedComments,
    })

    const updated = {
      ...currentPost,
      designerDone: true,
      designerDoneAt: doneAt,
      status: "aprovacao" as const,
      comments: updatedComments,
    }
    setCurrentPost(updated)
    onPostUpdated(updated)
    setMarkingDone(false)
    // Fecha o modal após 1.5s para o designer ver o feedback
    setTimeout(() => onClose(), 1500)
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

  const netCfg = networkConfig[currentPost.network]

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100 flex-shrink-0">
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

          {/* ── Hero image (imageUrl ou última imagem de anexo) ── */}
          {heroImage ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt={currentPost.title} className="w-full object-contain max-h-72" />
              {!currentPost.imageUrl && lastImageAttachment && (
                <p className="text-[11px] text-slate-400 text-center py-1.5 bg-slate-50 border-t border-slate-100">
                  Última imagem enviada: <span className="font-medium">{lastImageAttachment.name ?? "sem título"}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <ImageOff className="w-5 h-5 text-slate-300" />
              <span className="text-sm text-slate-400">Nenhuma imagem ainda</span>
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

            {/* Existing attachments list */}
            {(currentPost.attachments ?? []).length > 0 ? (
              <div className="space-y-2 mb-4">
                {(currentPost.attachments ?? []).map(att => (
                  <div key={att.id} className="rounded-lg border border-slate-200 overflow-hidden">
                    {att.type === "image" ? (
                      /* Image attachment — show as preview with download button */
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.content}
                          alt={att.name ?? "imagem"}
                          className="w-full max-h-56 object-contain bg-slate-50"
                        />
                        <button
                          onClick={() => downloadAttachment(att.content, att.name)}
                          className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium hover:bg-black/70 transition-colors"
                          title="Baixar imagem"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar
                        </button>
                        {att.name && (
                          <p className="text-xs text-slate-500 px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5">
                            <ImagePlus className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                            {att.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Note / Link attachment */
                      <div className="flex items-start gap-3 p-3 bg-slate-50">
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
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-4">Nenhum anexo ainda.</p>
            )}

            {/* Add attachment form */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                {(["note", "link", "image"] as AttachmentTab[]).map(tab => {
                  const icons = { note: FileText, link: Link2, image: ImagePlus }
                  const labels = { note: "Observação", link: "Link", image: "Imagem" }
                  const Icon = icons[tab]
                  return (
                    <button
                      key={tab}
                      onClick={() => setAttachTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                        attachTab === tab
                          ? "bg-white text-slate-800 border-b-2 border-violet-500"
                          : "bg-slate-50 text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {labels[tab]}
                    </button>
                  )
                })}
              </div>

              <div className="p-3 space-y-2">
                {attachTab !== "image" && (
                  <input
                    type="text"
                    value={attachName}
                    onChange={e => setAttachName(e.target.value)}
                    placeholder="Nome / título (opcional)"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                )}

                {attachTab === "note" && (
                  <textarea
                    value={attachContent}
                    onChange={e => setAttachContent(e.target.value)}
                    placeholder="Escreva sua observação aqui..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
                  />
                )}

                {attachTab === "link" && (
                  <input
                    type="url"
                    value={attachContent}
                    onChange={e => setAttachContent(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                )}

                {attachTab === "image" && (
                  <div className="space-y-2">
                    {/* Upload area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                        imagePreview
                          ? "border-violet-300 bg-violet-50"
                          : "border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >
                      {imagePreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="preview" className="max-h-40 max-w-full rounded object-contain" />
                          <p className="text-xs text-violet-500 font-medium">Clique para trocar</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-300" />
                          <p className="text-sm text-slate-500 font-medium">Clique para selecionar imagem</p>
                          <p className="text-xs text-slate-400">JPG, PNG, WEBP — máx. 5 MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {imagePreview && (
                      <input
                        type="text"
                        value={attachName}
                        onChange={e => setAttachName(e.target.value)}
                        placeholder="Nome do arquivo (opcional)"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                      />
                    )}
                  </div>
                )}

                <button
                  onClick={handleAddAttachment}
                  disabled={savingAttach || !attachContent}
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
                placeholder="Adicione um comentário... (Enter para enviar)"
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
          {/* ── Marcar como concluído ── */}
          <div className={`rounded-xl border-2 p-4 transition-colors ${
            currentPost.designerDone
              ? "border-emerald-200 bg-emerald-50"
              : "border-dashed border-slate-200 bg-slate-50"
          }`}>
            {currentPost.designerDone ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Trabalho concluído!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Notificação enviada ao admin em{" "}
                    {format(new Date(currentPost.designerDoneAt!), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Finalizou o trabalho?</p>
                  <p className="text-xs text-slate-500 mt-0.5">O admin será notificado para revisar.</p>
                </div>
                <button
                  onClick={handleMarkDone}
                  disabled={markingDone}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  {markingDone
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CircleCheck className="w-4 h-4" />
                  }
                  {markingDone ? "Salvando..." : "Marcar como concluído"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Post, PostStatus, PostAttachment } from "@/types"
import { statusConfig, networkConfig } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  CheckCircle, XCircle, MessageCircle, Clock,
  ImageIcon, Link2, FileText, X, Pencil,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface KanbanProps {
  posts: Post[]
  onStatusChange: (postId: string, status: PostStatus) => void
  onPostUpdate: (data: Partial<Post>) => void
  onPostDelete: (postId: string) => void
  authorName?: string
}

const columns: { id: PostStatus; label: string; color: string; bg: string; border: string }[] = [
  { id: "ideia",     label: "Ideias",     color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200" },
  { id: "aprovacao", label: "Aprovação",  color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200" },
  { id: "agendado",  label: "Agendados",  color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200" },
  { id: "publicado", label: "Publicados", color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200" },
]

export function Kanban({ posts, onStatusChange, onPostUpdate, onPostDelete, authorName }: KanbanProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comment, setComment] = useState("")
  const [attachmentType, setAttachmentType] = useState<"image" | "link" | "note" | null>(null)
  const [linkInput, setLinkInput] = useState("")
  const [noteInput, setNoteInput] = useState("")

  // Inline title editing on cards
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitleValue, setEditingTitleValue] = useState("")

  // Dialog title editing
  const [editingDialogTitle, setEditingDialogTitle] = useState(false)
  const [editingDialogTitleValue, setEditingDialogTitleValue] = useState("")

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId as PostStatus
    onStatusChange(draggableId, newStatus)
  }

  function handleApprove(post: Post) {
    onStatusChange(post.id, "agendado")
    setSelectedPost(null)
  }

  function handleReject(post: Post) {
    onStatusChange(post.id, "ideia")
    setSelectedPost(null)
  }

  // ── Inline title edit ──────────────────────────────────
  function startEditTitle(post: Post, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingTitleId(post.id)
    setEditingTitleValue(post.title)
  }

  function saveTitle(post: Post) {
    const newTitle = editingTitleValue.trim()
    if (newTitle && newTitle !== post.title) {
      onPostUpdate({ ...post, title: newTitle })
    }
    setEditingTitleId(null)
  }

  // ── Dialog title edit ─────────────────────────────────
  function openDialogTitleEdit() {
    if (!selectedPost) return
    setEditingDialogTitleValue(selectedPost.title)
    setEditingDialogTitle(true)
  }

  function saveDialogTitle() {
    if (!selectedPost) return
    const newTitle = editingDialogTitleValue.trim()
    if (newTitle && newTitle !== selectedPost.title) {
      const updated = { ...selectedPost, title: newTitle }
      onPostUpdate(updated)
      setSelectedPost(updated)
    }
    setEditingDialogTitle(false)
  }

  // ── Attachments ───────────────────────────────────────
  function handleAddAttachment(post: Post, attachment: PostAttachment) {
    const updated: Post = { ...post, attachments: [...(post.attachments ?? []), attachment] }
    onPostUpdate(updated)
    setSelectedPost(updated)
  }

  function handleRemoveAttachment(post: Post, attachmentId: string) {
    const updated: Post = { ...post, attachments: (post.attachments ?? []).filter((a) => a.id !== attachmentId) }
    onPostUpdate(updated)
    setSelectedPost(updated)
  }

  function handleImageUpload(post: Post, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleAddAttachment(post, { id: `a${Date.now()}`, type: "image", content: reader.result as string, name: file.name })
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  function handleAddLink(post: Post) {
    if (!linkInput.trim()) return
    handleAddAttachment(post, { id: `a${Date.now()}`, type: "link", content: linkInput })
    setLinkInput("")
    setAttachmentType(null)
  }

  function handleAddNote(post: Post) {
    if (!noteInput.trim()) return
    handleAddAttachment(post, { id: `a${Date.now()}`, type: "note", content: noteInput })
    setNoteInput("")
    setAttachmentType(null)
  }

  function handleComment(post: Post) {
    if (!comment.trim()) return
    onPostUpdate({
      ...post,
      comments: [
        ...post.comments,
        {
          id: `c${Date.now()}`,
          postId: post.id,
          authorId: "gestor",
          authorName: authorName ?? "Gestor",
          authorRole: "gestor" as const,
          content: comment,
          createdAt: new Date().toISOString(),
        },
      ],
    })
    setComment("")
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {columns.map((col) => {
            const colPosts = posts.filter((p) => p.status === col.id)
            return (
              <div key={col.id} className="flex-shrink-0 w-64 sm:w-72">
                {/* Column header */}
                <div className={cn("flex items-center justify-between px-3 py-2 rounded-xl mb-3 border", col.bg, col.border)}>
                  <span className={cn("text-xs font-semibold uppercase tracking-wide", col.color)}>
                    {col.label}
                  </span>
                  <span className={cn("text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border", col.bg, col.color, col.border)}>
                    {colPosts.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[400px] rounded-xl p-2 transition-colors",
                        snapshot.isDraggingOver ? "bg-slate-100" : "bg-slate-50/60"
                      )}
                    >
                      {colPosts.map((post, index) => {
                        const imgAttachments = (post.attachments ?? []).filter((a) => a.type === "image")
                        const isEditingTitle = editingTitleId === post.id

                        return (
                          <Draggable key={post.id} draggableId={post.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => !isEditingTitle && setSelectedPost(post)}
                                className={cn(
                                  "bg-white rounded-xl border border-slate-200 p-3 mb-2 cursor-pointer hover:shadow-sm transition-all select-none group",
                                  snapshot.isDragging && "shadow-lg rotate-1 border-violet-300"
                                )}
                              >
                                {/* Network badge + approve/reject */}
                                <div className="flex items-center justify-between mb-2">
                                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", networkConfig[post.network].color)}>
                                    {networkConfig[post.network].label}
                                  </span>
                                  {post.status === "aprovacao" && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleApprove(post) }}
                                        className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                                        title="Aprovar"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleReject(post) }}
                                        className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                                        title="Reprovar"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* ── TITLE (inline editable) ── */}
                                <div className="flex items-start gap-1 mb-1 min-h-[20px]">
                                  {isEditingTitle ? (
                                    <input
                                      autoFocus
                                      value={editingTitleValue}
                                      onChange={(e) => setEditingTitleValue(e.target.value)}
                                      onBlur={() => saveTitle(post)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveTitle(post)
                                        if (e.key === "Escape") setEditingTitleId(null)
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-violet-400 outline-none pb-0.5 w-full"
                                      placeholder="Título do post..."
                                    />
                                  ) : (
                                    <>
                                      <p className="flex-1 font-semibold text-slate-900 text-sm leading-tight">
                                        {post.title
                                          ? post.title
                                          : <span className="text-slate-300 italic font-normal text-xs">Sem título</span>
                                        }
                                      </p>
                                      <button
                                        onClick={(e) => startEditTitle(post, e)}
                                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 text-slate-300 hover:text-violet-500 transition-all"
                                        title="Editar título"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Caption preview */}
                                {post.caption && (
                                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                                    {post.caption}
                                  </p>
                                )}

                                {/* ── IMAGE PREVIEW STRIP ── */}
                                {imgAttachments.length > 0 && (
                                  <div className="flex gap-1 mt-2 mb-1">
                                    {imgAttachments.slice(0, 3).map((att) => (
                                      <div
                                        key={att.id}
                                        className="flex-shrink-0 w-14 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                                      >
                                        <img
                                          src={att.content}
                                          alt={att.name ?? "Imagem"}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                    {imgAttachments.length > 3 && (
                                      <div className="flex-shrink-0 w-14 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                        <span className="text-[10px] text-slate-500 font-semibold">
                                          +{imgAttachments.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Attachment indicators (non-image) */}
                                {(post.attachments ?? []).some((a) => a.type !== "image") && (
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {(post.attachments ?? []).filter((a) => a.type === "link").length > 0 && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full flex items-center gap-0.5 font-medium">
                                        <Link2 className="w-2.5 h-2.5" />
                                        {(post.attachments ?? []).filter((a) => a.type === "link").length} link
                                      </span>
                                    )}
                                    {(post.attachments ?? []).filter((a) => a.type === "note").length > 0 && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full flex items-center gap-0.5 font-medium">
                                        <FileText className="w-2.5 h-2.5" />
                                        {(post.attachments ?? []).filter((a) => a.type === "note").length} nota
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(post.scheduledAt), "dd/MM", { locale: ptBR })}
                                  </div>
                                  {post.comments.length > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                      <MessageCircle className="w-3 h-3" />
                                      {post.comments.length}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}

                      {colPosts.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-8 text-slate-300 text-xs">
                          Arraste um post aqui
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Post detail popup */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => {
          setSelectedPost(null); setComment(""); setAttachmentType(null)
          setLinkInput(""); setNoteInput(""); setEditingDialogTitle(false)
        }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
            <DialogHeader>
              {/* ── Editable dialog title ── */}
              <div className="flex items-center gap-2 pr-6">
                {editingDialogTitle ? (
                  <input
                    autoFocus
                    value={editingDialogTitleValue}
                    onChange={(e) => setEditingDialogTitleValue(e.target.value)}
                    onBlur={saveDialogTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveDialogTitle()
                      if (e.key === "Escape") setEditingDialogTitle(false)
                    }}
                    className="flex-1 text-slate-900 text-base font-semibold bg-transparent border-b-2 border-violet-400 outline-none pb-0.5"
                    placeholder="Título do post..."
                  />
                ) : (
                  <>
                    <DialogTitle className="text-slate-900 text-base font-semibold flex-1">
                      {selectedPost.title || <span className="text-slate-400 italic font-normal text-sm">Sem título</span>}
                    </DialogTitle>
                    <button
                      onClick={openDialogTitleEdit}
                      className="flex-shrink-0 text-slate-300 hover:text-violet-500 transition-colors"
                      title="Editar título"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-1">
              {/* Status + network + date */}
              <div className="flex gap-2 flex-wrap">
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", statusConfig[selectedPost.status].color)}>
                  {statusConfig[selectedPost.status].label}
                </span>
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", networkConfig[selectedPost.network].color)}>
                  {networkConfig[selectedPost.network].label}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(selectedPost.scheduledAt), "dd/MM/yyyy 'às' HH:mm")}
                </span>
              </div>

              {/* Caption */}
              {selectedPost.caption && (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedPost.caption}</p>
                  {selectedPost.hashtags?.length > 0 && (
                    <p className="text-sm text-violet-600 mt-2">{selectedPost.hashtags.join(" ")}</p>
                  )}
                </div>
              )}

              {/* Attachments */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Anexos</p>

                {(selectedPost.attachments ?? []).length > 0 && (
                  <div className="space-y-2">
                    {selectedPost.attachments!.map((att) => (
                      <div key={att.id}>
                        {att.type === "image" ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200">
                            <img src={att.content} alt={att.name ?? "Imagem"} className="w-full max-h-52 object-cover" />
                            <button
                              onClick={() => handleRemoveAttachment(selectedPost, att.id)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {att.name && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5">
                                <p className="text-white text-[11px] truncate">{att.name}</p>
                              </div>
                            )}
                          </div>
                        ) : att.type === "link" ? (
                          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-100">
                            <Link2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <a href={att.content} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 hover:underline flex-1 truncate">{att.content}</a>
                            <button onClick={() => handleRemoveAttachment(selectedPost, att.id)} className="text-green-400 hover:text-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100">
                            <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 flex-1 leading-relaxed">{att.content}</p>
                            <button onClick={() => handleRemoveAttachment(selectedPost, att.id)} className="text-amber-400 hover:text-red-500 transition-colors flex-shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!attachmentType && (
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Imagem
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(selectedPost, e)} />
                    </label>
                    <button onClick={() => setAttachmentType("link")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                      <Link2 className="w-3.5 h-3.5" />
                      Link
                    </button>
                    <button onClick={() => setAttachmentType("note")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      Nota
                    </button>
                  </div>
                )}

                {attachmentType === "link" && (
                  <div className="space-y-2">
                    <input
                      autoFocus
                      placeholder="https://..."
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(selectedPost); if (e.key === "Escape") { setAttachmentType(null); setLinkInput("") } }}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddLink(selectedPost)} disabled={!linkInput.trim()} className="flex-1 text-xs" style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
                        Adicionar link
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setAttachmentType(null); setLinkInput("") }} className="border-red-200 text-red-600 hover:bg-red-50 text-xs">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {attachmentType === "note" && (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      placeholder="Escreva uma nota ou instrução..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows={3}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddNote(selectedPost)} disabled={!noteInput.trim()} className="flex-1 text-xs" style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
                        Adicionar nota
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setAttachmentType(null); setNoteInput("") }} className="border-red-200 text-red-600 hover:bg-red-50 text-xs">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Approve/reject */}
              {selectedPost.status === "aprovacao" && (
                <div className="flex gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <Button onClick={() => handleApprove(selectedPost)} className="flex-1 bg-green-600 hover:bg-green-700 gap-2 h-9 text-sm">
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </Button>
                  <Button onClick={() => handleReject(selectedPost)} className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2 h-9 text-sm font-semibold">
                    <XCircle className="w-4 h-4" /> Reprovar
                  </Button>
                </div>
              )}

              {/* Comments */}
              {selectedPost.comments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Comentários</p>
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

              {/* Add comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Deixe um comentário ou instrução..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="resize-none border-slate-200 text-slate-900 bg-white text-sm focus-visible:ring-violet-500/50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleComment(selectedPost)}
                  disabled={!comment.trim()}
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                >
                  Enviar comentário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

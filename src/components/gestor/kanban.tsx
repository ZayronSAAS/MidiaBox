"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Post, PostStatus } from "@/types"
import { statusConfig, networkConfig } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, MessageCircle, Clock, Globe } from "lucide-react"
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
    onStatusChange(post.id, "reprovado")
    setSelectedPost(null)
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
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold uppercase tracking-wide", col.color)}>
                      {col.label}
                    </span>
                  </div>
                  <span className={cn("text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center", col.bg, col.color, col.border, "border")}>
                    {colPosts.length}
                  </span>
                </div>

                {/* Droppable area */}
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
                      {colPosts.map((post, index) => (
                        <Draggable key={post.id} draggableId={post.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedPost(post)}
                              className={cn(
                                "bg-white rounded-xl border border-slate-200 p-3 mb-2 cursor-pointer hover:shadow-sm transition-all select-none",
                                snapshot.isDragging && "shadow-lg rotate-1 border-violet-300"
                              )}
                            >
                              {/* Network badge */}
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
                                      className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors"
                                      title="Reprovar"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Title */}
                              <p className="font-medium text-slate-900 text-sm leading-tight mb-1">{post.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{post.caption}</p>

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
                      ))}
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
        <Dialog open={!!selectedPost} onOpenChange={() => { setSelectedPost(null); setComment("") }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-base font-semibold pr-6">{selectedPost.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-1">
              {/* Status + network */}
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
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedPost.caption}</p>
                {selectedPost.hashtags?.length > 0 && (
                  <p className="text-sm text-violet-600 mt-2">{selectedPost.hashtags.join(" ")}</p>
                )}
              </div>

              {/* Approve/reject for aprovacao status */}
              {selectedPost.status === "aprovacao" && (
                <div className="flex gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <Button
                    onClick={() => handleApprove(selectedPost)}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2 h-9 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedPost)}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-2 h-9 text-sm"
                  >
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

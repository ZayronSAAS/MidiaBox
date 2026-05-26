"use client"

import { useState } from "react"
import { Post, PostAttachment } from "@/types"
import { Plus, Check, Link2, FileText, ImageIcon, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ListaProps {
  posts: Post[]
  onStatusChange: (postId: string, status: "ideia") => void
  onPostCreate: (data: Partial<Post>) => void
  onPostUpdate: (data: Partial<Post>) => void
  onPostDelete: (postId: string) => void
}

export function Lista({ posts, onStatusChange, onPostCreate, onPostUpdate, onPostDelete }: ListaProps) {
  const listPosts = posts.filter((p) => p.status === "rascunho")

  const [addingNew, setAddingNew] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCaption, setNewCaption] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [attachmentType, setAttachmentType] = useState<"image" | "link" | "note" | null>(null)
  const [linkInput, setLinkInput] = useState("")
  const [noteInput, setNoteInput] = useState("")

  function handleCheck(post: Post) {
    onStatusChange(post.id, "ideia")
    setSelectedPost(null)
  }

  function handleAddNew() {
    if (!newTitle.trim()) return
    onPostCreate({
      title: newTitle,
      caption: newCaption,
      status: "rascunho",
      network: "instagram",
      scheduledAt: new Date().toISOString(),
      hashtags: [],
      attachments: [],
    })
    setNewTitle("")
    setNewCaption("")
    setAddingNew(false)
  }

  function handleAddAttachment(post: Post, attachment: PostAttachment) {
    const updated: Post = {
      ...post,
      attachments: [...(post.attachments ?? []), attachment],
    }
    onPostUpdate(updated)
    setSelectedPost(updated)
  }

  function handleRemoveAttachment(post: Post, attachmentId: string) {
    const updated: Post = {
      ...post,
      attachments: (post.attachments ?? []).filter((a) => a.id !== attachmentId),
    }
    onPostUpdate(updated)
    setSelectedPost(updated)
  }

  function handleImageUpload(post: Post, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleAddAttachment(post, {
        id: `a${Date.now()}`,
        type: "image",
        content: reader.result as string,
        name: file.name,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  function handleAddLink(post: Post) {
    if (!linkInput.trim()) return
    handleAddAttachment(post, {
      id: `a${Date.now()}`,
      type: "link",
      content: linkInput,
    })
    setLinkInput("")
    setAttachmentType(null)
  }

  function handleAddNote(post: Post) {
    if (!noteInput.trim()) return
    handleAddAttachment(post, {
      id: `a${Date.now()}`,
      type: "note",
      content: noteInput,
    })
    setNoteInput("")
    setAttachmentType(null)
  }

  return (
    <>
      <div className="space-y-2.5 max-w-2xl">
        {/* Add new idea */}
        {!addingNew ? (
          <button
            onClick={() => setAddingNew(true)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-500 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar ideia
          </button>
        ) : (
          <div className="bg-white rounded-xl border border-violet-200 p-4 space-y-3 shadow-sm">
            <Input
              autoFocus
              placeholder="Título da ideia..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddNew()
                if (e.key === "Escape") { setAddingNew(false); setNewTitle(""); setNewCaption("") }
              }}
              className="border-slate-200 text-slate-900 bg-white focus-visible:ring-violet-500/50"
            />
            <Textarea
              placeholder="Descrição ou legenda (opcional)..."
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              rows={2}
              className="resize-none border-slate-200 text-slate-900 bg-white focus-visible:ring-violet-500/50 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddNew}
                disabled={!newTitle.trim()}
                className="font-medium"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
              >
                Adicionar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setAddingNew(false); setNewTitle(""); setNewCaption("") }}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {listPosts.length === 0 && !addingNew && (
          <div className="text-center py-14 text-slate-400">
            <p className="text-sm">Nenhuma ideia na lista ainda.</p>
            <p className="text-xs mt-1 text-slate-300">Adicione ideias acima. Ao dar check, vão para o Kanban.</p>
          </div>
        )}

        {listPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start gap-3 hover:border-slate-300 transition-all group"
          >
            {/* Checkbox */}
            <button
              onClick={() => handleCheck(post)}
              title="Mover para Kanban (Ideias)"
              className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 border-slate-300 hover:border-violet-500 hover:bg-violet-50 transition-colors flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-transparent group-hover:text-violet-400 transition-colors" />
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedPost(post)}>
              <p className="text-sm font-medium text-slate-900">{post.title}</p>
              {post.caption && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{post.caption}</p>
              )}
              {(post.attachments ?? []).length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {post.attachments!.map((att) => (
                    <span
                      key={att.id}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium",
                        att.type === "image" && "bg-blue-50 text-blue-600",
                        att.type === "link" && "bg-green-50 text-green-600",
                        att.type === "note" && "bg-amber-50 text-amber-600"
                      )}
                    >
                      {att.type === "image" && <ImageIcon className="w-2.5 h-2.5" />}
                      {att.type === "link" && <Link2 className="w-2.5 h-2.5" />}
                      {att.type === "note" && <FileText className="w-2.5 h-2.5" />}
                      {att.type === "image" ? (att.name ?? "Imagem") : att.type === "link" ? "Link" : "Nota"}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Date + delete */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-slate-400">
                {format(new Date(post.createdAt), "dd/MM", { locale: ptBR })}
              </span>
              <button
                onClick={() => onPostDelete(post.id)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail popup */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => { setSelectedPost(null); setAttachmentType(null) }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-base font-semibold pr-6">{selectedPost.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-1">
              {selectedPost.caption && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPost.caption}</p>
                </div>
              )}

              {/* Attachments section */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Anexos</p>

                {(selectedPost.attachments ?? []).length > 0 && (
                  <div className="space-y-2">
                    {selectedPost.attachments!.map((att) => (
                      <div key={att.id}>
                        {att.type === "image" ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200">
                            <img
                              src={att.content}
                              alt={att.name ?? "Imagem"}
                              className="w-full max-h-52 object-cover"
                            />
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
                            <a
                              href={att.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-700 hover:underline flex-1 truncate"
                            >
                              {att.content}
                            </a>
                            <button
                              onClick={() => handleRemoveAttachment(selectedPost, att.id)}
                              className="text-green-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100">
                            <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 flex-1 leading-relaxed">{att.content}</p>
                            <button
                              onClick={() => handleRemoveAttachment(selectedPost, att.id)}
                              className="text-amber-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add attachment controls */}
                {!attachmentType && (
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(selectedPost, e)}
                      />
                    </label>
                    <button
                      onClick={() => setAttachmentType("link")}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Link
                    </button>
                    <button
                      onClick={() => setAttachmentType("note")}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Nota
                    </button>
                  </div>
                )}

                {attachmentType === "link" && (
                  <div className="space-y-2">
                    <Input
                      autoFocus
                      placeholder="https://..."
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(selectedPost); if (e.key === "Escape") { setAttachmentType(null); setLinkInput("") } }}
                      className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddLink(selectedPost)}
                        disabled={!linkInput.trim()}
                        className="flex-1 text-xs"
                        style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
                      >
                        Adicionar link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setAttachmentType(null); setLinkInput("") }}
                        className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {attachmentType === "note" && (
                  <div className="space-y-2">
                    <Textarea
                      autoFocus
                      placeholder="Escreva uma nota ou instrução..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows={3}
                      className="resize-none border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddNote(selectedPost)}
                        disabled={!noteInput.trim()}
                        className="flex-1 text-xs"
                        style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
                      >
                        Adicionar nota
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setAttachmentType(null); setNoteInput("") }}
                        className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Move to Kanban button */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  onClick={() => handleCheck(selectedPost)}
                  className="w-full gap-2 font-medium h-10"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
                >
                  <Check className="w-4 h-4" />
                  Mover para Kanban — Ideias
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

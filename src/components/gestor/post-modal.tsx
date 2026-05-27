"use client"

import { useState } from "react"
import { Post, PostStatus, PostNetwork, PostFormat } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { statusConfig, networkConfig } from "@/lib/utils"
import { format } from "date-fns"

interface PostModalProps {
  post?: Post | null
  open: boolean
  onClose: () => void
  onSave: (post: Partial<Post>) => void
  onDelete?: (id: string) => void
  clientId: string
  viewOnly?: boolean
}

const networks: PostNetwork[] = ["instagram", "tiktok", "linkedin", "facebook", "twitter", "youtube"]
const statuses: PostStatus[] = ["ideia", "rascunho", "aprovacao", "agendado", "publicado", "reprovado"]
const formats: { value: PostFormat; label: string }[] = [
  { value: "foto",      label: "📷 Foto" },
  { value: "reels",     label: "🎬 Reels" },
  { value: "carrossel", label: "🖼️ Carrossel" },
  { value: "stories",   label: "⚡ Stories" },
]

export function PostModal({ post, open, onClose, onSave, onDelete, clientId, viewOnly = false }: PostModalProps) {
  const isNew = !post

  const [title, setTitle] = useState(post?.title ?? "")
  const [caption, setCaption] = useState(post?.caption ?? "")
  const [network, setNetwork] = useState<PostNetwork>(post?.network ?? "instagram")
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "ideia")
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduledAt ? format(new Date(post.scheduledAt), "yyyy-MM-dd'T'HH:mm") : ""
  )
  const [postFormat, setPostFormat] = useState<PostFormat>(post?.format ?? "foto")
  const [hashtags, setHashtags] = useState(post?.hashtags?.join(" ") ?? "")
  const [comment, setComment] = useState("")

  function handleSave() {
    onSave({
      id: post?.id,
      clientId,
      title,
      caption,
      network,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      format: postFormat,
      hashtags: hashtags.split(/\s+/).filter(Boolean),
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo post" : viewOnly ? post?.title : "Editar post"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {!viewOnly && (
            <>
              <div className="space-y-1.5">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Promoção fim de semana" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Rede social</Label>
                  <Select value={network} onValueChange={(v) => setNetwork(v as PostNetwork)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {networks.map((n) => (
                        <SelectItem key={n} value={n}>{networkConfig[n].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Formato</Label>
                <div className="flex gap-2 flex-wrap">
                  {formats.map(f => (
                    <button key={f.value} type="button"
                      onClick={() => setPostFormat(f.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                        postFormat === f.value
                          ? "bg-violet-600 text-white border-violet-600"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Data e horário</Label>
                <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Legenda</Label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escreva a legenda do post..."
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Hashtags</Label>
                <Input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#café #coffeelover #barista"
                />
              </div>
            </>
          )}

          {viewOnly && post && (
            <>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[post.status].color}`}>
                  {statusConfig[post.status].label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${networkConfig[post.network].color}`}>
                  {networkConfig[post.network].label}
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.caption}</p>
                {post.hashtags?.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">{post.hashtags.join(" ")}</p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Agendado para: {format(new Date(post.scheduledAt), "dd/MM/yyyy 'às' HH:mm")}
              </p>

              {post.comments && post.comments.length > 0 && (
                <div className="space-y-2">
                  <Label>Comentários</Label>
                  {post.comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{c.authorName}</span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(c.createdAt), "dd/MM")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-2">
            {!viewOnly && (
              <>
                <Button onClick={handleSave} className="flex-1">
                  {isNew ? "Criar post" : "Salvar"}
                </Button>
                {!isNew && onDelete && (
                  <Button
                    variant="outline"
                    onClick={() => { onDelete(post!.id); onClose() }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Excluir
                  </Button>
                )}
              </>
            )}
            {viewOnly && (
              <Button variant="outline" onClick={onClose} className="flex-1">Fechar</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

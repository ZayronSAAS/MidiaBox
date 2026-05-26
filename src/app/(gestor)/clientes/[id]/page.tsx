"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { mockPosts } from "@/lib/mock-data"
import { useClients } from "@/lib/clients-context"
import { Client, Post, PostStatus } from "@/types"
import { Calendar } from "@/components/gestor/calendar"
import { PostModal } from "@/components/gestor/post-modal"
import { Kanban } from "@/components/gestor/kanban"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { statusConfig, networkConfig } from "@/lib/utils"
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

const colorPresets = [
  "#6F4E37", "#E91E63", "#2E7D32", "#1565C0", "#F57C00",
  "#6A1B9A", "#00838F", "#AD1457", "#558B2F", "#4527A0",
]

export default function ClientePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { clients, deleteClient: deleteClientCtx, updateClient: updateClientCtx } = useClients()
  const found = clients.find((c) => c.id === id)
  const [client, setClient] = useState<Client | null>(found ?? null)
  const [posts, setPosts] = useState<Post[]>(mockPosts.filter((p) => p.clientId === id))
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newPostDate, setNewPostDate] = useState<Date | null>(null)
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all")

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Client>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Cliente não encontrado.</p>
        <Link href="/clientes"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    )
  }

  function openEdit() {
    setEditForm({
      name: client!.name,
      niche: client!.niche,
      toneOfVoice: client!.toneOfVoice,
      briefing: client!.briefing,
      color: client!.color,
      socialNetworks: client!.socialNetworks.map((sn) => ({ ...sn })),
    })
    setEditOpen(true)
  }

  function handleEditSave() {
    if (client) updateClientCtx(client.id, editForm)
    setClient((prev) => prev ? { ...prev, ...editForm } : prev)
    setEditOpen(false)
  }

  function handleDeleteClient() {
    deleteClientCtx(id)
    router.push("/clientes")
  }

  function updateSocialHandle(index: number, handle: string) {
    setEditForm((prev) => {
      const nets = [...(prev.socialNetworks ?? [])]
      nets[index] = { ...nets[index], handle }
      return { ...prev, socialNetworks: nets }
    })
  }

  function handleSave(data: Partial<Post>) {
    if (data.id) {
      setPosts((prev) => prev.map((p) => p.id === data.id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    } else {
      const newPost: Post = {
        id: `p${Date.now()}`,
        clientId: id,
        title: data.title ?? "Novo post",
        caption: data.caption ?? "",
        network: data.network ?? "instagram",
        status: data.status ?? "ideia",
        scheduledAt: data.scheduledAt ?? new Date().toISOString(),
        hashtags: data.hashtags ?? [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setPosts((prev) => [...prev, newPost])
    }
  }

  function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  function handleStatusChange(postId: string, status: PostStatus) {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, status, updatedAt: new Date().toISOString() } : p
    ))
  }

  function handlePostUpdate(data: Partial<Post>) {
    if (data.id) {
      setPosts((prev) => prev.map((p) => p.id === data.id ? { ...p, ...data } : p))
    }
  }

  function openNewPost(date?: Date) {
    setSelectedPost(null)
    setNewPostDate(date ?? null)
    setModalOpen(true)
  }

  const filteredPosts = filterStatus === "all" ? posts : posts.filter((p) => p.status === filterStatus)
  const pendingCount = posts.filter((p) => p.status === "aprovacao").length

  const statusFilters: Array<{ value: PostStatus | "all"; label: string }> = [
    { value: "all", label: "Todos" },
    { value: "ideia", label: "Ideias" },
    { value: "rascunho", label: "Rascunhos" },
    { value: "aprovacao", label: "Aprovação" },
    { value: "agendado", label: "Agendados" },
    { value: "publicado", label: "Publicados" },
  ]

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-7">
        <Link href="/clientes">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: client.color }}
        >
          {client.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{client.name}</h1>
          <p className="text-xs text-slate-500">{client.niche}</p>
        </div>
        {pendingCount > 0 && (
          <span className="bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full ml-1">
            {pendingCount} aguardando aprovação
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 sm:px-3 py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 px-2.5 sm:px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excluir</span>
          </button>
          <Button onClick={() => openNewPost()} className="gap-2 h-9 font-medium"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <Plus className="w-4 h-4" />
            Novo post
          </Button>
        </div>
      </div>

      <Tabs defaultValue="kanban">
        <TabsList className="mb-6 bg-slate-100 border-0">
          <TabsTrigger value="kanban" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Kanban</TabsTrigger>
          <TabsTrigger value="calendario" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Calendário</TabsTrigger>
          <TabsTrigger value="lista" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Lista</TabsTrigger>
          <TabsTrigger value="briefing" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Briefing</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <Kanban
            posts={posts}
            onStatusChange={handleStatusChange}
            onPostUpdate={handlePostUpdate}
            onPostDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="calendario">
          <Calendar
            posts={posts}
            onPostClick={(post) => { setSelectedPost(post); setModalOpen(true) }}
            onDayClick={(date) => openNewPost(date)}
          />
        </TabsContent>

        <TabsContent value="lista">
          <div className="flex gap-2 mb-4 flex-wrap">
            {statusFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  filterStatus === value
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {label}
                {value !== "all" && (
                  <span className="ml-1.5 opacity-60">
                    {posts.filter((p) => p.status === value).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredPosts.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>Nenhum post encontrado.</p>
              </div>
            )}
            {filteredPosts
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .map((post) => (
                <div
                  key={post.id}
                  onClick={() => { setSelectedPost(post); setModalOpen(true) }}
                  className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{post.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5 max-w-md truncate">{post.caption}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${networkConfig[post.network].color}`}>
                      {networkConfig[post.network].label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[post.status].color}`}>
                      {statusConfig[post.status].label}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {format(new Date(post.scheduledAt), "dd/MM · HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="briefing">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-2xl">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Tom de voz</p>
              <p className="text-slate-800 text-sm">{client.toneOfVoice}</p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Briefing</p>
              <p className="text-slate-800 text-sm leading-relaxed">{client.briefing}</p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2.5">Redes sociais</p>
              <div className="flex gap-2 flex-wrap">
                {client.socialNetworks.map((sn) => (
                  <span key={sn.platform}
                    className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg">
                    {sn.handle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <PostModal
        open={modalOpen}
        post={selectedPost}
        onClose={() => { setModalOpen(false); setSelectedPost(null) }}
        onSave={handleSave}
        onDelete={handleDelete}
        clientId={id}
      />

      {/* Modal de edição do cliente */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-base font-semibold">Editar cliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Nome do cliente</Label>
              <Input
                value={editForm.name ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Nicho */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Nicho / Segmento</Label>
              <Input
                value={editForm.niche ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, niche: e.target.value }))}
                className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Cor */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Cor do cliente</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editForm.color ?? "#6F4E37"}
                  onChange={(e) => setEditForm((p) => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditForm((p) => ({ ...p, color: c }))}
                      className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: editForm.color === c ? "#7c3aed" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tom de voz */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Tom de voz</Label>
              <Input
                value={editForm.toneOfVoice ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, toneOfVoice: e.target.value }))}
                className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Briefing */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Briefing</Label>
              <Textarea
                value={editForm.briefing ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, briefing: e.target.value }))}
                rows={3}
                className="resize-none border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>

            {/* Redes sociais */}
            {(editForm.socialNetworks ?? []).length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 font-medium">Redes sociais</Label>
                {(editForm.socialNetworks ?? []).map((sn, i) => (
                  <div key={sn.platform} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 capitalize w-20 flex-shrink-0">{sn.platform}</span>
                    <Input
                      value={sn.handle}
                      onChange={(e) => updateSocialHandle(i, e.target.value)}
                      className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleEditSave}
                className="flex-1 font-semibold"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}
              >
                Salvar alterações
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-base font-semibold">Excluir cliente</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-slate-500">
              Tem certeza que deseja excluir <span className="font-semibold text-slate-900">{client.name}</span>? Todos os posts e dados serão perdidos.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDeleteClient}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir cliente
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

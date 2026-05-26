"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClients } from "@/lib/clients-context"
import { getPostsByClient, createPost, updatePost, deletePost } from "@/lib/posts-service"
import { Client, Post, PostStatus } from "@/types"
import { PostModal } from "@/components/gestor/post-modal"
import { Kanban } from "@/components/gestor/kanban"
import { Lista } from "@/components/gestor/lista"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
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

  const { clients, loading: clientsLoading, deleteClient: deleteClientCtx, updateClient: updateClientCtx } = useClients()
  const client = clients.find((c) => c.id === id) ?? null

  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Client>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Load posts from Supabase
  useEffect(() => {
    async function load() {
      setPostsLoading(true)
      const data = await getPostsByClient(id)
      setPosts(data)
      setPostsLoading(false)
    }
    load()
  }, [id])

  if (clientsLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Cliente não encontrado.</p>
        <Link href="/clientes">
          <Button variant="outline" className="mt-4">Voltar</Button>
        </Link>
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

  async function handleEditSave() {
    await updateClientCtx(id, editForm)
    setEditOpen(false)
  }

  async function handleDeleteClient() {
    await deleteClientCtx(id)
    router.push("/clientes")
  }

  function updateSocialHandle(index: number, handle: string) {
    setEditForm((prev) => {
      const nets = [...(prev.socialNetworks ?? [])]
      nets[index] = { ...nets[index], handle }
      return { ...prev, socialNetworks: nets }
    })
  }

  async function handleSave(data: Partial<Post>) {
    if (data.id) {
      // Update existing
      setPosts((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
      )
      void updatePost(data.id, data)
    } else {
      // Create new — await to get real ID from Supabase
      const newPost = await createPost({
        clientId: id,
        title: data.title ?? "Novo post",
        caption: data.caption ?? "",
        network: data.network ?? "instagram",
        status: data.status ?? "ideia",
        scheduledAt: data.scheduledAt ?? new Date().toISOString(),
        hashtags: data.hashtags ?? [],
        comments: [],
        attachments: [],
      })
      if (newPost) {
        setPosts((prev) => [...prev, newPost])
      }
    }
  }

  async function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    void deletePost(postId)
  }

  async function handleStatusChange(postId: string, status: PostStatus) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status, updatedAt: new Date().toISOString() } : p))
    )
    void updatePost(postId, { status })
  }

  async function handlePostUpdate(data: Partial<Post>) {
    if (data.id) {
      setPosts((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)))
      void updatePost(data.id, data)
    }
  }

  function openNewPost() {
    setSelectedPost(null)
    setModalOpen(true)
  }

  const pendingCount = posts.filter((p) => p.status === "aprovacao").length

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
          <Button onClick={openNewPost} className="gap-2 h-9 font-medium"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <Plus className="w-4 h-4" />
            Novo post
          </Button>
        </div>
      </div>

      {postsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
        </div>
      ) : (
        <Tabs defaultValue="kanban">
          <TabsList className="mb-6 bg-slate-100 border-0">
            <TabsTrigger value="kanban" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Kanban</TabsTrigger>
            <TabsTrigger value="lista" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Lista</TabsTrigger>
            <TabsTrigger value="informacoes" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <Kanban
              posts={posts}
              onStatusChange={handleStatusChange}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="lista">
            <Lista
              posts={posts}
              onStatusChange={handleStatusChange}
              onPostCreate={handleSave}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="informacoes">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-2xl">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Tom de voz</p>
                <p className="text-slate-800 text-sm">{client.toneOfVoice || "—"}</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Briefing</p>
                <p className="text-slate-800 text-sm leading-relaxed">{client.briefing || "—"}</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2.5">Redes sociais</p>
                {client.socialNetworks.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {client.socialNetworks.map((sn) => (
                      <span key={sn.platform} className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg">
                        {sn.handle}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Nenhuma rede social cadastrada.</p>
                )}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Nicho</p>
                <p className="text-slate-800 text-sm">{client.niche || "—"}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <PostModal
        open={modalOpen}
        post={selectedPost}
        onClose={() => { setModalOpen(false); setSelectedPost(null) }}
        onSave={handleSave}
        onDelete={handleDelete}
        clientId={id}
      />

      {/* Modal de edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-base font-semibold">Editar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Nome do cliente</Label>
              <Input
                value={editForm.name ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Nicho / Segmento</Label>
              <Input
                value={editForm.niche ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, niche: e.target.value }))}
                className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>
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
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Tom de voz</Label>
              <Input
                value={editForm.toneOfVoice ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, toneOfVoice: e.target.value }))}
                className="border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 font-medium">Briefing</Label>
              <Textarea
                value={editForm.briefing ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, briefing: e.target.value }))}
                rows={3}
                className="resize-none border-slate-200 bg-white text-slate-900 focus-visible:ring-violet-500/50"
              />
            </div>
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

      {/* Modal de exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-base font-semibold">Excluir cliente</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-slate-500">
              Tem certeza que deseja excluir <span className="font-semibold text-slate-900">{client.name}</span>?
              Todos os posts e dados serão perdidos.
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

"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { mockClients, mockPosts } from "@/lib/mock-data"
import { Post, PostStatus } from "@/types"
import { Calendar } from "@/components/gestor/calendar"
import { PostModal } from "@/components/gestor/post-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { statusConfig, networkConfig } from "@/lib/utils"
import { ArrowLeft, Plus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ClientePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const client = mockClients.find((c) => c.id === id)
  const [posts, setPosts] = useState<Post[]>(mockPosts.filter((p) => p.clientId === id))
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newPostDate, setNewPostDate] = useState<Date | null>(null)
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all")

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Cliente não encontrado.</p>
        <Link href="/clientes"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    )
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
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
        <div className="ml-auto">
          <Button onClick={() => openNewPost()} className="gap-2 h-9 font-medium"
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 283), oklch(0.55 0.25 300))" }}>
            <Plus className="w-4 h-4" />
            Novo post
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendario">
        <TabsList className="mb-6 bg-slate-100 border-0">
          <TabsTrigger value="calendario" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Calendário</TabsTrigger>
          <TabsTrigger value="lista" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Lista</TabsTrigger>
          <TabsTrigger value="briefing" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">Briefing</TabsTrigger>
        </TabsList>

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
    </div>
  )
}

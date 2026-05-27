"use client"

import Link from "next/link"
import { Post, Client } from "@/types"
import { ClientAvatar } from "@/components/gestor/client-avatar"
import { networkConfig } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UpcomingPostsProps {
  posts: Post[]
  clients: Client[]
}

const FORMAT_LABELS: Record<string, string> = {
  reels: "Reels", carrossel: "Carrossel", foto: "Foto", stories: "Stories",
}

export function UpcomingPosts({ posts, clients }: UpcomingPostsProps) {
  const now = new Date()

  const upcoming = posts
    .filter(p => p.status === "agendado" && new Date(p.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4)

  function getClient(clientId: string) {
    return clients.find(c => c.id === clientId)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col">
      <p className="text-sm font-semibold text-slate-900 mb-4">Próximas publicações</p>

      {upcoming.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-400">Nenhum post agendado.</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {upcoming.map(post => {
            const client = getClient(post.clientId)
            if (!client) return null
            const netConf = networkConfig[post.network]
            return (
              <Link key={post.id} href={`/clientes/${client.id}`}>
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                  <ClientAvatar name={client.name} color={client.color} logo={client.logo} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate group-hover:text-violet-600 transition-colors">
                      {post.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {format(new Date(post.scheduledAt), "dd MMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${netConf.color}`}>
                      {netConf.label}
                    </span>
                    {post.format && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {FORMAT_LABELS[post.format] ?? post.format}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

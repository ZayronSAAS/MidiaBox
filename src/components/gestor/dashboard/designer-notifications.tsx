"use client"

import Link from "next/link"
import type { Post } from "@/types"
import { CheckCircle2, ArrowRight, BellRing } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { networkConfig } from "@/lib/utils"

interface DesignerNotificationsProps {
  posts: Post[]
  clientNames: Record<string, string>
}

export function DesignerNotifications({ posts, clientNames }: DesignerNotificationsProps) {
  const donePosts = posts
    .filter(p => p.designerDone)
    .sort((a, b) => new Date(b.designerDoneAt!).getTime() - new Date(a.designerDoneAt!).getTime())

  if (donePosts.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border-b border-emerald-100">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <BellRing className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Designer concluiu {donePosts.length} trabalho{donePosts.length > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-emerald-600">Aguardando sua revisão</p>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {donePosts.slice(0, 5).map(post => {
          const net = networkConfig[post.network]
          return (
            <div key={post.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${net.color}`}>
                      {net.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {clientNames[post.clientId] ?? "—"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{post.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Concluído em{" "}
                    {format(new Date(post.designerDoneAt!), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <Link
                href={`/clientes/${post.clientId}`}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium flex-shrink-0 transition-colors"
              >
                Ver <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )
        })}
      </div>

      {donePosts.length > 5 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center">
            +{donePosts.length - 5} outros trabalhos concluídos
          </p>
        </div>
      )}
    </div>
  )
}

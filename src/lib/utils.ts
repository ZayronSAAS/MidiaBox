import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PostStatus, PostNetwork } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusConfig: Record<PostStatus, { label: string; color: string }> = {
  ideia:      { label: "Ideia",      color: "bg-slate-100 text-slate-600" },
  rascunho:   { label: "Rascunho",   color: "bg-yellow-100 text-yellow-700" },
  aprovacao:  { label: "Aprovação",  color: "bg-orange-100 text-orange-700" },
  agendado:   { label: "Agendado",   color: "bg-blue-100 text-blue-700" },
  publicado:  { label: "Publicado",  color: "bg-green-100 text-green-700" },
  reprovado:  { label: "Reprovado",  color: "bg-red-100 text-red-700" },
}

export const networkConfig: Record<PostNetwork, { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "bg-pink-100 text-pink-700" },
  tiktok:    { label: "TikTok",    color: "bg-slate-800 text-slate-100" },
  linkedin:  { label: "LinkedIn",  color: "bg-blue-100 text-blue-700" },
  facebook:  { label: "Facebook",  color: "bg-indigo-100 text-indigo-700" },
  twitter:   { label: "X/Twitter", color: "bg-sky-100 text-sky-700" },
  youtube:   { label: "YouTube",   color: "bg-red-100 text-red-700" },
}

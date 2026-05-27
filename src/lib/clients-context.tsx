"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/types"

interface ClientsContextType {
  clients: Client[]
  loading: boolean
  deleteClient: (id: string) => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  addClient: (data: Omit<Client, "id" | "createdAt">) => Promise<Client | null>
  reload: () => Promise<void>
}

const ClientsContext = createContext<ClientsContextType | null>(null)

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: (row.slug as string) ?? "",
    niche: (row.niche as string) ?? "",
    logo: (row.logo as string) ?? undefined,
    socialNetworks: (row.social_networks as Client["socialNetworks"]) ?? [],
    toneOfVoice: (row.tone_of_voice as string) ?? "",
    briefing: (row.briefing as string) ?? "",
    color: (row.color as string) ?? "#6366f1",
    createdAt: row.created_at as string,
    responsibleName: (row.responsible_name as string) ?? "",
    cityState: (row.city_state as string) ?? "",
    reportDay: (row.report_day as string) ?? "",
    contractValue: (row.contract_value as string) ?? "",
    whatsapp: (row.whatsapp as string) ?? "",
    email: (row.email as string) ?? "",
    brandColors: (row.brand_colors as string[]) ?? [],
    fixedHashtags: (row.fixed_hashtags as string) ?? "",
    contentRestrictions: (row.content_restrictions as string) ?? "",
    approvalFlow: (row.approval_flow as string) ?? "",
    postsPerWeek: (row.posts_per_week as number) ?? 4,
  }
}

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchClients() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: true })
    if (!error && data) {
      setClients(data.map((r) => mapClient(r as Record<string, unknown>)))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  async function deleteClient(id: string) {
    const supabase = createClient()
    await supabase.from("clients").delete().eq("id", id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  async function updateClient(id: string, data: Partial<Client>) {
    const supabase = createClient()
    const update: Record<string, unknown> = {}
    if (data.name !== undefined) update.name = data.name
    if (data.niche !== undefined) update.niche = data.niche
    if (data.logo !== undefined) update.logo = data.logo ?? null
    if (data.toneOfVoice !== undefined) update.tone_of_voice = data.toneOfVoice
    if (data.briefing !== undefined) update.briefing = data.briefing
    if (data.color !== undefined) update.color = data.color
    if (data.socialNetworks !== undefined) update.social_networks = data.socialNetworks
    if (data.slug !== undefined) update.slug = data.slug
    if (data.responsibleName !== undefined) update.responsible_name = data.responsibleName
    if (data.cityState !== undefined) update.city_state = data.cityState
    if (data.reportDay !== undefined) update.report_day = data.reportDay
    if (data.contractValue !== undefined) update.contract_value = data.contractValue
    if (data.whatsapp !== undefined) update.whatsapp = data.whatsapp
    if (data.email !== undefined) update.email = data.email
    if (data.brandColors !== undefined) update.brand_colors = data.brandColors
    if (data.fixedHashtags !== undefined) update.fixed_hashtags = data.fixedHashtags
    if (data.contentRestrictions !== undefined) update.content_restrictions = data.contentRestrictions
    if (data.approvalFlow !== undefined) update.approval_flow = data.approvalFlow
    if (data.postsPerWeek !== undefined) update.posts_per_week = data.postsPerWeek
    await supabase.from("clients").update(update).eq("id", id)
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    )
  }

  async function addClient(data: Omit<Client, "id" | "createdAt">): Promise<Client | null> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: row, error } = await supabase
      .from("clients")
      .insert({
        gestor_id: user.id,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        niche: data.niche,
        logo: data.logo ?? null,
        tone_of_voice: data.toneOfVoice,
        briefing: data.briefing,
        color: data.color,
        social_networks: data.socialNetworks,
      })
      .select()
      .single()

    if (error || !row) return null
    const newClient = mapClient(row as Record<string, unknown>)
    setClients((prev) => [...prev, newClient])
    return newClient
  }

  return (
    <ClientsContext.Provider
      value={{ clients, loading, deleteClient, updateClient, addClient, reload: fetchClients }}
    >
      {children}
    </ClientsContext.Provider>
  )
}

export function useClients() {
  const ctx = useContext(ClientsContext)
  if (!ctx) throw new Error("useClients must be used within ClientsProvider")
  return ctx
}

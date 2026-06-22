import { createClient } from "@/lib/supabase/client"
import type { Post } from "@/types"

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    title: row.title as string,
    caption: (row.caption as string) ?? "",
    network: row.network as Post["network"],
    status: row.status as Post["status"],
    scheduledAt: row.scheduled_at as string,
    publishedAt: (row.published_at as string) ?? undefined,
    imageUrl: (row.image_url as string) ?? undefined,
    hashtags: (row.hashtags as string[]) ?? [],
    comments: (row.comments as Post["comments"]) ?? [],
    attachments: (row.attachments as Post["attachments"]) ?? [],
    format: (row.format as Post["format"]) ?? "foto",
    designerDone: (row.designer_done as boolean) ?? false,
    designerDoneAt: (row.designer_done_at as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getPostsByClient(
  clientId: string,
  status?: string
): Promise<Post[]> {
  const supabase = createClient()
  let query = supabase
    .from("posts")
    .select(
      "id, client_id, title, caption, network, status, scheduled_at, published_at, image_url, hashtags, comments, attachments, format, designer_done, designer_done_at, created_at, updated_at"
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error || !data) return []
  return data.map(mapPost)
}

// Busca posts SEM attachments nem comments completos (ambos podem ter base64 de imagens pesadas).
// O dashboard só precisa de metadados — o kanban carrega tudo por cliente, sob demanda.
export async function getAllPosts(): Promise<Post[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, client_id, title, caption, network, status, scheduled_at, published_at, image_url, hashtags, format, designer_done, designer_done_at, created_at, updated_at"
    )
    .order("updated_at", { ascending: false })
  if (error || !data) return []
  return data.map(mapPost)
}

export async function createPost(
  post: Omit<Post, "id" | "createdAt" | "updatedAt">
): Promise<Post | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("posts")
    .insert({
      client_id: post.clientId,
      gestor_id: user.id,
      title: post.title,
      caption: post.caption,
      network: post.network,
      status: post.status,
      scheduled_at: post.scheduledAt,
      hashtags: post.hashtags,
      comments: post.comments ?? [],
      attachments: post.attachments ?? [],
      format: post.format ?? "foto",
    })
    .select()
    .single()

  if (error || !data) return null
  return mapPost(data as Record<string, unknown>)
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<void> {
  const supabase = createClient()
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.title !== undefined) update.title = updates.title
  if (updates.caption !== undefined) update.caption = updates.caption
  if (updates.network !== undefined) update.network = updates.network
  if (updates.status !== undefined) update.status = updates.status
  if (updates.scheduledAt !== undefined) update.scheduled_at = updates.scheduledAt
  if (updates.hashtags !== undefined) update.hashtags = updates.hashtags
  if (updates.comments !== undefined) update.comments = updates.comments
  if (updates.attachments !== undefined) update.attachments = updates.attachments
  if (updates.format !== undefined) update.format = updates.format
  if (updates.designerDone !== undefined) update.designer_done = updates.designerDone
  if (updates.designerDoneAt !== undefined) update.designer_done_at = updates.designerDoneAt
  await supabase.from("posts").update(update).eq("id", id)
}

export async function deletePost(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("posts").delete().eq("id", id)
}

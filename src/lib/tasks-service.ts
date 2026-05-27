import { createClient } from "@/lib/supabase/client"
import type { Task } from "@/types"

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    clientId: (row.client_id as string) ?? null,
    text: row.text as string,
    done: (row.done as boolean) ?? false,
    date: row.date as string,
    createdAt: row.created_at as string,
  }
}

export async function getTasks(date?: string): Promise<Task[]> {
  const supabase = createClient()
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: true })
  if (date) query = query.eq("date", date)
  const { data, error } = await query
  if (error || !data) return []
  return data.map((r) => mapTask(r as Record<string, unknown>))
}

export async function createTask(
  task: Omit<Task, "id" | "createdAt">
): Promise<Task | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      gestor_id: user.id,
      client_id: task.clientId ?? null,
      text: task.text,
      done: task.done,
      date: task.date,
    })
    .select()
    .single()
  if (error || !data) return null
  return mapTask(data as Record<string, unknown>)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const supabase = createClient()
  const update: Record<string, unknown> = {}
  if (updates.text !== undefined) update.text = updates.text
  if (updates.done !== undefined) update.done = updates.done
  if (updates.clientId !== undefined) update.client_id = updates.clientId
  await supabase.from("tasks").update(update).eq("id", id)
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("tasks").delete().eq("id", id)
}

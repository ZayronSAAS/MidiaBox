import { createClient } from "@/lib/supabase/client"
import type { ClientMetric } from "@/types"

function mapMetric(row: Record<string, unknown>): ClientMetric {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    month: row.month as number,
    year: row.year as number,
    reach: (row.reach as number) ?? 0,
    engagementRate: (row.engagement_rate as number) ?? 0,
    followerGrowth: (row.follower_growth as number) ?? 0,
    postsPlanned: (row.posts_planned as number) ?? 0,
    postsPublished: (row.posts_published as number) ?? 0,
    createdAt: row.created_at as string,
  }
}

/** Load metrics for a set of (month, year) pairs — used for sparklines and KPI deltas. */
export async function getMetrics(params: {
  months: number[]
  years: number[]
}): Promise<ClientMetric[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("client_metrics")
    .select("*")
    .in("month", params.months)
    .in("year", params.years)
  if (error || !data) return []
  return data.map((r) => mapMetric(r as Record<string, unknown>))
}

/** Insert or update a metric row (unique on client_id + month + year). */
export async function upsertMetric(
  metric: Omit<ClientMetric, "id" | "createdAt">
): Promise<ClientMetric | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from("client_metrics")
    .upsert(
      {
        gestor_id: user.id,
        client_id: metric.clientId,
        month: metric.month,
        year: metric.year,
        reach: metric.reach,
        engagement_rate: metric.engagementRate,
        follower_growth: metric.followerGrowth,
        posts_planned: metric.postsPlanned,
        posts_published: metric.postsPublished,
      },
      { onConflict: "client_id,month,year" }
    )
    .select()
    .single()
  if (error || !data) return null
  return mapMetric(data as Record<string, unknown>)
}

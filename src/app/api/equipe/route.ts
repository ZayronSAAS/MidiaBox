import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  // ── Authenticate the gestor ──────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "gestor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  const { name, email, password, role, clientId } = await request.json() as {
    name: string
    email: string
    password: string
    role: "designer" | "aprovador" | "cliente"
    clientId?: string
  }

  if (!name || !email || !password || !["designer", "aprovador", "cliente"].includes(role)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  if (role === "cliente" && !clientId) {
    return NextResponse.json({ error: "Selecione o cliente vinculado" }, { status: 400 })
  }

  // ── Create Supabase Auth user ─────────────────────────────────────────────
  const admin = createAdminClient()
  const metadata: Record<string, unknown> = { name, role, gestor_id: user.id }
  if (role === "cliente" && clientId) metadata.client_id = clientId

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Erro ao criar usuário" },
      { status: 400 }
    )
  }

  // ── Store in team_members ─────────────────────────────────────────────────
  const memberRow: Record<string, unknown> = {
    gestor_id: user.id,
    user_id: created.user.id,
    name,
    email,
    role,
  }
  if (role === "cliente" && clientId) memberRow.client_id = clientId
  await supabase.from("team_members").insert(memberRow)

  return NextResponse.json({ success: true, userId: created.user.id })
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== "gestor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { memberId, userId } = await request.json() as { memberId: string; userId: string }

  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(userId)
  await supabase.from("team_members").delete().eq("id", memberId)

  return NextResponse.json({ success: true })
}

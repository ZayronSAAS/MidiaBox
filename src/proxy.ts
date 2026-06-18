import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const role = user?.user_metadata?.role as string | undefined

  // Rotas públicas — qualquer um pode acessar
  const publicRoutes = ['/login', '/cadastro']
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    if (user) {
      if (role === 'gestor') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/acompanhamento', request.url))
    }
    return supabaseResponse
  }

  // Usuário não autenticado em rota protegida → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rotas exclusivas do gestor
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/clientes') || pathname.startsWith('/calendario')) {
    if (role !== 'gestor') {
      return NextResponse.redirect(new URL('/acompanhamento', request.url))
    }
  }

  // Rotas do cliente — gestor é redirecionado
  if (pathname.startsWith('/acompanhamento')) {
    if (role === 'gestor') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

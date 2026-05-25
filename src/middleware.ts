import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Se não autenticado e não está na página de login → redireciona para login
  if (!user && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se já autenticado e está na página de login → redireciona para área correta
  if (user && pathname === '/login') {
    const role = user.user_metadata?.role
    return NextResponse.redirect(
      new URL(role === 'gestor' ? '/dashboard' : '/acompanhamento', request.url)
    )
  }

  // Protege rotas do gestor — cliente não pode acessar
  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/clientes'))) {
    if (user.user_metadata?.role !== 'gestor') {
      return NextResponse.redirect(new URL('/acompanhamento', request.url))
    }
  }

  // Protege rotas do cliente — gestor não pode acessar diretamente
  if (user && pathname.startsWith('/acompanhamento')) {
    if (user.user_metadata?.role !== 'cliente') {
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

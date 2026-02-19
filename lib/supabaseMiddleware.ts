import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // ✅ ນີ້ຄືສ່ວນທີ່ເຮັດໃຫ້ Cookie ປະກົດໃນ Browser
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. ຖ້າບໍ່ມີ User ແລະ ບໍ່ໄດ້ຢູ່ໜ້າ login ໃຫ້ໄປໜ້າ login
if (!user && !request.nextUrl.pathname.startsWith('/login')) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

// 2. ຖ້າມີ User ແລ້ວ ແລະ ພະຍາຍາມເຂົ້າໜ້າ login ໃຫ້ໄປໜ້າຫຼັກ
if (user && request.nextUrl.pathname.startsWith('/login')) {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.redirect(url)
}

  return response
}
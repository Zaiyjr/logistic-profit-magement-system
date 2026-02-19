import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabaseMiddleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * ຈັບທຸກ Path ຍົກເວັ້ນ:
     * - api (ຖ້າເຈົ້າມີ API routes ທີ່ບໍ່ຢາກໃຫ້ Middleware ຄຸມ)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.jpg (ໄຟລ໌ຮູບພາບຕ່າງໆ)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
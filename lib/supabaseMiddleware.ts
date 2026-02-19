import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // ✅ ນີ້ຄືສ່ວນທີ່ເຮັດໃຫ້ Cookie ປະກົດໃນ Browser
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  // ໃນ lib/supabaseMiddleware.ts
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const isLoginPage = url.pathname === "/login";

  // 🚩 ກໍລະນີທີ 1: ບໍ່ມີ User ແລ້ວພະຍາຍາມເຂົ້າໜ້າອື່ນທີ່ບໍ່ແມ່ນ Login
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🚩 ກໍລະນີທີ 2: ມີ User ແລ້ວ ແຕ່ພະຍາຍາມຈະເຂົ້າໜ້າ Login ອີກ
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ຖ້າບໍ່ເຂົ້າເງື່ອນໄຂຂ້າງເທິງ ໃຫ້ປ່ອຍຜ່ານ (Next)
  return response;
}

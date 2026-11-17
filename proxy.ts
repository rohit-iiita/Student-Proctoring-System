import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const VALID_ROLES = ["student", "faculty", "admin"] as const;

type Role = (typeof VALID_ROLES)[number];

const PROTECTED_PATHS = [
  "/dashboard",
  "/complaints",
  "/meetings",
  "/profile",
  "/notifications",
  "/notification",
] as const;

const AUTH_PATHS = ["/login", "/signup"] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function normalizeRole(value: string | null | undefined): Role | null {
  return VALID_ROLES.includes(value as Role) ? (value as Role) : null;
}

function createRedirectResponse(
  request: NextRequest,
  pathname: string,
  searchParams: URLSearchParams,
  supabaseResponse: NextResponse,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  for (const [key, value] of searchParams.entries()) {
    url.searchParams.set(key, value);
  }

  const redirectResponse = NextResponse.redirect(url);
  for (const cookie of supabaseResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  }
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = supabaseResponse.headers.get(header);
    if (value) redirectResponse.headers.set(header, value);
  }
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;
  const userRole =
    normalizeRole(
      typeof claims?.user_metadata?.role === "string"
        ? claims.user_metadata.role
        : null,
    ) ?? "student";

  const { pathname } = request.nextUrl;

  if (!claims && isProtectedPath(pathname)) {
    return createRedirectResponse(
      request,
      "/login",
      new URLSearchParams(),
      supabaseResponse,
    );
  }

  if (claims && isAuthPath(pathname)) {
    return createRedirectResponse(
      request,
      "/dashboard",
      new URLSearchParams({ role: userRole }),
      supabaseResponse,
    );
  }

  if (claims && isProtectedPath(pathname)) {
    const isDashboard =
      pathname === "/dashboard" || pathname.startsWith("/dashboard/");

    if (isDashboard) {
      const roleParam = normalizeRole(request.nextUrl.searchParams.get("role"));
      if (roleParam !== userRole) {
        return createRedirectResponse(
          request,
          "/dashboard",
          new URLSearchParams({ role: userRole }),
          supabaseResponse,
        );
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/complaints/:path*",
    "/meetings/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/notification/:path*",
    "/login",
    "/signup",
  ],
};

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function hasEnabledAuthProvider() {
  return Boolean(
    (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) ||
    (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) ||
    process.env.EMAIL_AUTH_ENABLED === "true"
  );
}

export async function middleware(request: NextRequest) {
  if (!hasEnabledAuthProvider()) return NextResponse.next();
  const token = await getToken({ req: request });
  if (!token) return NextResponse.redirect(new URL("/signin", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/jobs/:path*", "/applications/:path*", "/profile/:path*", "/interviews/:path*", "/outcomes/:path*", "/settings/:path*", "/saved/:path*", "/admin/:path*"] };

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/jobs/:path*", "/applications/:path*", "/profile/:path*", "/interviews/:path*", "/outcomes/:path*", "/settings/:path*", "/saved/:path*", "/admin/:path*"] };

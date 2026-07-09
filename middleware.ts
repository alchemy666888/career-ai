import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Coarse route protection placeholder. Auth.js session enforcement is performed server-side as providers are configured.
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/profile/:path*", "/jobs/:path*", "/applications/:path*", "/interviews/:path*", "/outcomes/:path*", "/settings/:path*"] };

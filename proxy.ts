import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {

  const userId = request.cookies.get("user_id")?.value

  // If not logged in → send to homepage login
  if (!userId || userId === "") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"]
}
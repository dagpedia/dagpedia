import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const nextUrl = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  const publicPaths = ["/login", "/api/auth"];
  if (publicPaths.some((p) => nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow Vercel Cron with secret
  if (nextUrl.pathname.startsWith("/api/cron")) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return NextResponse.next();
    }
  }

  // Require authentication for all other routes
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|vendor).*)"],
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Relaxed auth for local preview ("just to see" the new dashboard)
    if (process.env.NODE_ENV === "development" && pathname.startsWith("/dashboard")) {
      return NextResponse.next();
    }

    if (token?.error === "AccountDisabled") {
      return NextResponse.redirect(
        new URL("/login?error=AccountDisabled", req.url)
      );
    }

    // /users — admin only
    if (pathname.startsWith("/users") && token?.role !== Role.admin) {
      return NextResponse.redirect(
        new URL("/dashboard?error=Unauthorized", req.url)
      );
    }

    // /simulation — analyst, manager, admin
    if (
      pathname.startsWith("/simulation") &&
      token?.role === Role.viewer
    ) {
      return NextResponse.redirect(
        new URL("/dashboard?error=Unauthorized", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // In development, allow dashboard even without token
        if (process.env.NODE_ENV === "development") return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/simulation/:path*",
    "/users/:path*",
    "/admin/:path*",
    "/api/simulate/:path*",
    "/api/users/:path*",
  ],
};

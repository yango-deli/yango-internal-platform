import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Disabled accounts — bounce to login
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

    // /simulation — analyst, manager, admin (not viewer)
    if (pathname.startsWith("/simulation") && token?.role === Role.viewer) {
      return NextResponse.redirect(
        new URL("/dashboard?error=Unauthorized", req.url)
      );
    }

    // /hr — manager, admin (not analyst or viewer)
    if (
      pathname.startsWith("/hr") &&
      token?.role !== Role.admin &&
      token?.role !== Role.manager
    ) {
      return NextResponse.redirect(
        new URL("/dashboard?error=Unauthorized", req.url)
      );
    }

    // /api/hr — same restriction server-side
    if (
      pathname.startsWith("/api/hr") &&
      token?.role !== Role.admin &&
      token?.role !== Role.manager
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Any valid JWT → allow through (route-level checks above handle granular access)
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/simulation/:path*",
    "/hr/:path*",
    "/users/:path*",
    "/api/simulate/:path*",
    "/api/hr/:path*",
    "/api/users/:path*",
    "/api/dashboard/:path*",
  ],
};

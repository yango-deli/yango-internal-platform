import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

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

    // /recruitment — admin, manager, analyst (viewer blocked)
    if (
      pathname.startsWith("/recruitment") &&
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/simulation/:path*",
    "/recruitment/:path*",
    "/users/:path*",
    "/api/simulate/:path*",
    "/api/users/:path*",
    "/api/recruitment/:path*",
  ],
};

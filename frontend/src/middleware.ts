import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (process.env.NODE_ENV === "development" && pathname.startsWith("/dashboard")) {
      return NextResponse.next();
    }

    if (token?.error === "AccountDisabled") {
      return NextResponse.redirect(new URL("/login?error=AccountDisabled", req.url));
    }

    // /users — admin only
    if (pathname.startsWith("/users") && token?.role !== Role.admin) {
      return NextResponse.redirect(new URL("/dashboard?error=Unauthorized", req.url));
    }

    // /admin — admin only
    if (pathname.startsWith("/admin") && token?.role !== Role.admin) {
      return NextResponse.redirect(new URL("/dashboard?error=Unauthorized", req.url));
    }

    // /hr — manager, admin, hr (not viewer)
    if (pathname.startsWith("/hr") && token?.role === Role.viewer) {
      return NextResponse.redirect(new URL("/dashboard?error=Unauthorized", req.url));
    }

    // /hr/settings — admin only
    if (pathname.startsWith("/hr/settings") && token?.role !== Role.admin) {
      return NextResponse.redirect(new URL("/hr?error=Unauthorized", req.url));
    }

    // /simulation — analyst, manager, admin (not viewer)
    if (pathname.startsWith("/simulation") && token?.role === Role.viewer) {
      return NextResponse.redirect(new URL("/dashboard?error=Unauthorized", req.url));
    }

    // /recruitment — manager, admin (not viewer or analyst)
    if (
      pathname.startsWith("/recruitment") &&
      token?.role !== Role.admin &&
      token?.role !== Role.manager
    ) {
      return NextResponse.redirect(new URL("/dashboard?error=Unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
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
    "/hr/:path*",
    "/recruitment/:path*",
    "/api/simulate/:path*",
    "/api/users/:path*",
    "/api/hr/:path*",
    "/api/recruitment/:path*",
  ],
};

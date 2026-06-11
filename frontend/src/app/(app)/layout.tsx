import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Temporarily relaxed for local preview ("deploy locally just to see")
  // In real usage this would always redirect unauthenticated users.
  if (process.env.NODE_ENV !== "development" && (!session || session.error === "AccountDisabled")) {
    redirect("/login" + (session?.error ? `?error=${session.error}` : ""));
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar on left (ltr) / right (rtl) via order + html[dir] */}
      <div className="rtl:order-2">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 min-w-0 rtl:order-1">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

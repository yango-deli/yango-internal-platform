import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/users/users-table";
import { Shield } from "lucide-react";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== Role.admin) {
    redirect("/dashboard?error=Unauthorized");
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#FFCC00]" />
          User Management
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage access roles for platform users. New users are assigned the{" "}
          <span className="font-medium">viewer</span> role on first login.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[
          { role: "Admin", desc: "Full access + user management", color: "bg-[#FFCC00] text-gray-900" },
          { role: "Manager", desc: "Simulations + reports", color: "bg-green-100 text-green-800" },
          { role: "Analyst", desc: "Run simulations only", color: "bg-gray-100 text-gray-700" },
          { role: "Viewer", desc: "Read-only dashboard", color: "bg-white text-gray-600 border border-gray-200" },
        ].map(({ role, desc, color }) => (
          <div key={role} className="rounded-lg p-3 bg-white border border-gray-200">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
              {role}
            </span>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <UsersTable currentUserId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  );
}

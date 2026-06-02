import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Role } from "@prisma/client";
import { FlaskConical, TrendingUp, FileSpreadsheet, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === Role.admin || session?.user?.role === Role.manager;

  const runsWhere = isAdmin
    ? {}
    : { userId: session?.user?.id ?? "" };

  const [totalRuns, recentRuns] = await Promise.all([
    prisma.simulationRun.count({ where: runsWhere }),
    prisma.simulationRun.findMany({
      where: runsWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const thisMonth = recentRuns.filter(
    (r) => r.createdAt >= new Date(new Date().setDate(1))
  ).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5" /> Total Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalRuns)}</p>
            <p className="text-xs text-gray-500 mt-0.5">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{thisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">Simulations run</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Last File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {recentRuns[0]?.fileName ?? "No runs yet"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Most recent upload</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Last Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-gray-900">
              {recentRuns[0]
                ? new Date(recentRuns[0].createdAt).toLocaleDateString("en-GB")
                : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {recentRuns[0]
                ? new Date(recentRuns[0].createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                : "No activity"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent runs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Simulations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FlaskConical className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">No simulations yet.</p>
              <p className="text-xs mt-1">Run your first simulation to see results here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  {isAdmin && <TableHead>Run by</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Tiers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run) => {
                  const summary = run.summary as { tierResults?: unknown[] };
                  return (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium text-gray-900 max-w-[200px] truncate">
                        {run.fileName}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-gray-500 text-xs">
                          {run.user.name ?? run.user.email}
                        </TableCell>
                      )}
                      <TableCell className="text-gray-500 text-xs">
                        {new Date(run.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {Array.isArray(summary?.tierResults) ? summary.tierResults.length : 0} rows
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

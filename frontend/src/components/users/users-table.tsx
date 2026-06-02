"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, RefreshCw } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  image: string | null;
  createdAt: string;
  _count: { runs: number };
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  admin: "default",
  manager: "success",
  analyst: "secondary",
  viewer: "outline",
};

export function UsersTable({ currentUserId }: { currentUserId: string }) {
  const { data: users, mutate, isLoading } = useSWR<User[]>("/api/users", fetcher);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateUser = async (id: string, patch: Partial<Pick<User, "role" | "isActive">>) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await mutate();
      toast.success("User updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the platform? They will lose access immediately.`)) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await mutate();
      toast.success("User removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        Loading users...
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Simulations</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {(users ?? []).map((user) => {
          const isSelf = user.id === currentUserId;
          const busy = updating === user.id;

          return (
            <TableRow key={user.id} className={!user.isActive ? "opacity-50" : undefined}>
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.name ?? "—"}
                    {isSelf && (
                      <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </TableCell>

              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(val) => updateUser(user.id, { role: val })}
                  disabled={isSelf || busy}
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell>
                <button
                  onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                  disabled={isSelf || busy}
                  className="disabled:cursor-not-allowed"
                >
                  <Badge variant={user.isActive ? "success" : "outline"}>
                    {user.isActive ? "Active" : "Disabled"}
                  </Badge>
                </button>
              </TableCell>

              <TableCell className="text-right text-sm text-gray-600">
                {user._count.runs}
              </TableCell>

              <TableCell className="text-xs text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("en-GB")}
              </TableCell>

              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteUser(user.id, user.email)}
                  disabled={isSelf || busy}
                  className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

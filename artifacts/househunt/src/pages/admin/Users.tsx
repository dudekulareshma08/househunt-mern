import Navbar from "@/components/Navbar";
import { useAdminListUsers, useAdminApproveOwner, getAdminListUsersQueryKey, getAdminGetStatsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle, XCircle, UserCheck } from "lucide-react";

function roleBadge(role: string) {
  if (role === "admin") return "bg-violet-100 text-violet-700 border-0";
  if (role === "owner") return "bg-primary/10 text-primary border-0";
  return "bg-sky-100 text-sky-700 border-0";
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useAdminListUsers();
  const approveMutation = useAdminApproveOwner();

  function setApproval(id: number, isApproved: boolean) {
    approveMutation.mutate(
      { id, data: { isApproved } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
        },
      }
    );
  }

  const owners = users?.filter((u) => u.role === "owner") ?? [];
  const pendingOwners = owners.filter((u) => !u.isApproved);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users?.length ?? 0} total users · {pendingOwners.length} owners pending approval
          </p>
        </div>

        {pendingOwners.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-800 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> {pendingOwners.length} owner account{pendingOwners.length > 1 ? "s" : ""} awaiting approval
            </p>
            <div className="space-y-2">
              {pendingOwners.map((u) => (
                <div key={u.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-200">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1" onClick={() => setApproval(u.id, true)} disabled={approveMutation.isPending}>
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-14 bg-card border border-border rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users?.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`capitalize ${roleBadge(u.role)}`}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {u.role === "owner" ? (
                          <Badge className={u.isApproved ? "bg-emerald-100 text-emerald-700 border-0" : "bg-amber-100 text-amber-700 border-0"}>
                            {u.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-0">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {u.role === "owner" && (
                          u.isApproved ? (
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 text-xs gap-1" onClick={() => setApproval(u.id, false)} disabled={approveMutation.isPending}>
                              <XCircle className="w-3 h-3" /> Revoke
                            </Button>
                          ) : (
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1" onClick={() => setApproval(u.id, true)} disabled={approveMutation.isPending}>
                              <CheckCircle className="w-3 h-3" /> Approve
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

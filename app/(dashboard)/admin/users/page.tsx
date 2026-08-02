import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin");
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    // Fetch counts separately (MongoDB has no _count)
    const projectCounts = await prisma.project.groupBy({
        by: ["clientId"],
        _count: { id: true },
    });
    const appCounts = await prisma.application.groupBy({
        by: ["contractorId"],
        _count: { id: true },
    });

    const countMap = new Map<string, { projects: number; applications: number }>();
    for (const row of projectCounts) {
        countMap.set(row.clientId, { projects: row._count.id, applications: 0 });
    }
    for (const row of appCounts) {
        const existing = countMap.get(row.contractorId) ?? { projects: 0, applications: 0 };
        existing.applications = row._count.id;
        countMap.set(row.contractorId, existing);
    }

    return (
        <DashboardShell
            title="Users"
            description="Browse all registered users across the platform."
        >
            <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">User</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Verification</th>
                            <th className="px-4 py-3 font-medium">Projects</th>
                            <th className="px-4 py-3 font-medium">Applications</th>
                            <th className="px-4 py-3 font-medium">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {users.map((user) => {
                            const counts = countMap.get(user.id) ?? { projects: 0, applications: 0 };
                            return (
                                <tr key={user.id} className="bg-slate-900/40 transition-colors hover:bg-slate-900/80">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={user.name} size="sm" />
                                            <div>
                                                <p className="font-medium text-white">{user.name ?? "Unnamed"}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge tone={user.role === "ADMIN" ? "violet" : user.role === "CLIENT" ? "cyan" : "emerald"}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">—</td>
                                    <td className="px-4 py-3 text-slate-400">{counts.projects}</td>
                                    <td className="px-4 py-3 text-slate-400">{counts.applications}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </DashboardShell>
    );
}


import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Customer } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, AlertCircle, CheckCircle, Clock, UserX, GitBranch, Lock } from "lucide-react";

const ROLE_STYLES: Record<string, string> = {
  Administrators: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-0",
  Registered: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-0",
  Vendors: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-0",
  Guests: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0",
  Moderators: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-0",
};

const SERVICES = [
  { name: "GoeSignInManager", desc: "Lockout, last-activity, external OAuth, event publishing", icon: Lock, color: "text-blue-500" },
  { name: "WorkContext", desc: "HTTP-scoped: current customer, language, currency from JWT claims", icon: Users, color: "text-green-500" },
  { name: "StoreContext", desc: "Resolves active store from Host header with 10-min cache", icon: GitBranch, color: "text-purple-500" },
  { name: "TokenService", desc: "JWT Bearer issuance/validation with HMAC-SHA256", icon: Shield, color: "text-amber-500" },
  { name: "PermissionService", desc: "Role-based ACL — Administrators bypass all checks", icon: CheckCircle, color: "text-teal-500" },
  { name: "DeleteGuestsTask", desc: "Quartz.NET daily cleanup of guest records older than 7 days", icon: UserX, color: "text-red-500" },
];

const DOMAIN_EVENTS = [
  { name: "CustomerRegisteredEvent", fields: "CustomerId, Email, OccurredOnUtc" },
  { name: "CustomerLoggedInEvent", fields: "CustomerId, Email, IpAddress, OccurredOnUtc" },
  { name: "PasswordChangedEvent", fields: "CustomerId, OccurredOnUtc" },
];

export default function Identity() {
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: () => apiRequest("GET", "/api/customers").then(r => r.json()),
  });

  const roleCounts = customers.reduce((acc, c) => {
    acc[c.role] = (acc[c.role] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Identity</h2>
        <p className="text-xs text-muted-foreground mt-0.5">GOE.Identity module · ASP.NET Core Identity + JWT + ACL</p>
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {["Administrators", "Registered", "Vendors", "Moderators", "Guests"].map(role => (
          <Card key={role} data-testid={`role-card-${role.toLowerCase()}`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{roleCounts[role] ?? 0}</div>
              <Badge className={`${ROLE_STYLES[role] ?? ""} text-[10px] mt-1`}>{role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customers Table + Services side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Customer Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users size={15} className="text-primary" />
                Customers ({customers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Role</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading
                      ? [...Array(4)].map((_, i) => (
                        <tr key={i} className="border-b border-border">
                          {[...Array(4)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-3 w-full" /></td>)}
                        </tr>
                      ))
                      : customers.map(c => (
                        <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors" data-testid={`row-customer-${c.id}`}>
                          <td className="px-4 py-2.5">
                            <div className="font-medium text-foreground">{c.firstName} {c.lastName}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{c.email}</div>
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            <Badge className={`${ROLE_STYLES[c.role] ?? ""} text-[10px] px-1.5`}>{c.role}</Badge>
                          </td>
                          <td className="px-4 py-2.5">
                            {c.active
                              ? <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle size={11} /> Active</span>
                              : <span className="flex items-center gap-1 text-red-500"><AlertCircle size={11} /> Inactive</span>
                            }
                          </td>
                          <td className="px-4 py-2.5 text-right hidden md:table-cell">
                            <span className={c.failedLogins >= 5 ? "text-destructive font-bold" : c.failedLogins > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                              {c.failedLogins}
                            </span>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services panel */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield size={15} className="text-primary" />
                Application Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SERVICES.map(s => (
                <div key={s.name} className="flex items-start gap-2.5" data-testid={`service-${s.name.toLowerCase()}`}>
                  <s.icon size={14} className={`${s.color} mt-0.5 shrink-0`} />
                  <div>
                    <div className="text-xs font-semibold text-foreground font-mono">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground leading-snug">{s.desc}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Domain Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock size={15} className="text-primary" />
                Domain Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DOMAIN_EVENTS.map(e => (
                <div key={e.name} className="rounded-lg bg-muted/40 px-3 py-2" data-testid={`event-${e.name.toLowerCase()}`}>
                  <div className="text-[11px] font-semibold font-mono text-foreground">{e.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{e.fields}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lockout rule callout */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 flex items-start gap-3">
        <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs">
          <span className="font-semibold text-amber-800 dark:text-amber-300">Lockout Policy: </span>
          <span className="text-amber-700 dark:text-amber-400">5 consecutive failed login attempts trigger a 15-minute lockout. Customers with <strong>FailedLoginAttempts ≥ 5</strong> show in red above.</span>
        </div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Package, ShoppingCart, Users, DollarSign, GitBranch, CheckSquare, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const revenueData = [
  { month: "Nov", revenue: 1820 }, { month: "Dec", revenue: 2440 },
  { month: "Jan", revenue: 1980 }, { month: "Feb", revenue: 3100 },
  { month: "Mar", revenue: 2780 }, { month: "Apr", revenue: 3420 },
];

const orderStatusData = [
  { name: "Complete", value: 2, color: "#22c55e" },
  { name: "Processing", value: 2, color: "#3b82f6" },
  { name: "Pending", value: 1, color: "#f59e0b" },
  { name: "Cancelled", value: 1, color: "#ef4444" },
];

function StatCard({ title, value, icon: Icon, sub, color }: { title: string; value: string | number; icon: any; sub?: string; color?: string }) {
  return (
    <Card data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${color ?? "bg-accent"}`}>
            <Icon size={18} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => apiRequest("GET", "/api/orders").then(r => r.json()),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Platform Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">GOE — Global Order Engine · ASP.NET Core 10 backend</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={`$${stats?.revenue ?? 0}`} icon={DollarSign} sub="Completed orders" color="bg-green-100 dark:bg-green-900/40" />
        <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} icon={ShoppingCart} sub={`${stats?.pendingOrders} pending`} />
        <StatCard title="Products" value={stats?.totalProducts ?? 0} icon={Package} sub="In catalog" color="bg-purple-100 dark:bg-purple-900/40" />
        <StatCard title="Customers" value={stats?.totalCustomers ?? 0} icon={Users} sub="Registered" color="bg-orange-100 dark:bg-orange-900/40" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingCart size={15} className="text-primary" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {orderStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Test Progress + Recent Orders row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GitHub Issues Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GitBranch size={15} className="text-primary" />
              Integration Test Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: 1, label: "AuthController", tests: 17, module: "identity" },
              { id: 2, label: "GoeSignInManager", tests: 14, module: "identity" },
              { id: 3, label: "CheckoutService", tests: 14, module: "orders" },
              { id: 4, label: "PriceCalculationService", tests: 20, module: "pricing" },
              { id: 5, label: "Individual Calculators", tests: 27, module: "pricing" },
            ].map(issue => (
              <div key={issue.id} className="flex items-center gap-3" data-testid={`issue-summary-${issue.id}`}>
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <CheckSquare size={11} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">#{issue.id} {issue.label}</div>
                </div>
                <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">{issue.tests} tests</Badge>
                <a href={`https://github.com/paragpatidar25/AMNNSPK/issues/${issue.id}`} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline shrink-0">open</a>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={11} /> 92 total checklist items</span>
              <span className="text-primary font-medium">5 open issues</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingCart size={15} className="text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(orders ?? []).slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex items-center gap-3 text-xs" data-testid={`recent-order-${o.id}`}>
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                    #{o.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{o.customerEmail}</div>
                    <div className="text-muted-foreground">{o.paymentMethod?.replace("Payments.", "")}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">${o.total}</div>
                    <span className={`status-${o.orderStatus.toLowerCase()} px-1.5 py-0.5 rounded text-[10px] font-medium`}>
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backend Architecture */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Backend Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: "Identity", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", files: 14 },
              { name: "Catalog", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300", files: 11 },
              { name: "Pricing", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", files: 8 },
              { name: "Order", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", files: 9 },
              { name: "Payment", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", files: 3 },
              { name: "Inventory", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300", files: 3 },
              { name: "Shipping", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300", files: 2 },
              { name: "Vendor", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300", files: 3 },
              { name: "MultiStore", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300", files: 2 },
              { name: "Notification", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300", files: 5 },
              { name: "GOE.Shared", color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", files: 6 },
              { name: "GOE.Api", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", files: 4 },
            ].map(m => (
              <div key={m.name} className={`rounded-lg p-3 ${m.color}`} data-testid={`module-${m.name.toLowerCase()}`}>
                <div className="text-xs font-semibold">{m.name}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{m.files} files</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

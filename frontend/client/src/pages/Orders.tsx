import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Order } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User, CreditCard, Truck, RefreshCw } from "lucide-react";

const ORDER_STATUSES = ["Pending", "Processing", "Complete", "Cancelled"];

function StatusBadge({ status, type }: { status: string; type: "order" | "payment" | "shipping" }) {
  const statusMap: Record<string, string> = {
    Pending: "status-pending", Processing: "status-processing", Paid: "status-complete",
    Complete: "status-complete", Cancelled: "status-cancelled", Delivered: "status-complete",
    Shipped: "status-processing", Refunded: "status-cancelled", NotYetShipped: "status-pending",
    ShippingNotRequired: "status-closed", Authorized: "status-processing", PartiallyRefunded: "status-pending",
    Voided: "status-cancelled",
  };
  return (
    <span className={`${statusMap[status] ?? "status-pending"} px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap`}>
      {status}
    </span>
  );
}

export default function Orders() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: () => apiRequest("GET", "/api/orders").then(r => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Order status updated" });
    },
  });

  const filtered = filter === "All" ? orders : orders.filter(o => o.orderStatus === filter);

  const counts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.orderStatus === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Orders</h2>
        <p className="text-xs text-muted-foreground mt-0.5">GOE.Order module · {orders.length} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...ORDER_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            data-testid={`filter-${s.toLowerCase()}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {s}
            {s !== "All" && counts[s] > 0 && (
              <span className="ml-1.5 bg-white/20 text-[10px] px-1 rounded">{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Shipping</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 w-36 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Update</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                  : filtered.map(o => (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors" data-testid={`row-order-${o.id}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">#{o.id}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
                        {o.isGuest === 1 && <Badge variant="outline" className="text-[9px] px-1 mt-0.5">Guest</Badge>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-muted-foreground" />
                          <span className="text-xs truncate max-w-[150px]">{o.customerEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <StatusBadge status={o.paymentStatus} type="payment" />
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <CreditCard size={10} />
                          {o.paymentMethod?.replace("Payments.", "")}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <StatusBadge status={o.shippingStatus} type="shipping" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold">{o.currency} {o.total.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.orderStatus} type="order" />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Select
                          value={o.orderStatus}
                          onValueChange={status => updateMutation.mutate({ id: o.id, status })}
                        >
                          <SelectTrigger className="h-7 text-xs w-36" data-testid={`select-status-${o.id}`}>
                            <RefreshCw size={10} className="mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                }
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Domain events note */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <div className="font-semibold text-foreground text-xs">Order Domain Events (MediatR)</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {["PlaceOrderCommand", "CancelOrderCommand", "SubmitReturnRequestCommand", "CheckoutService"].map(e => (
            <span key={e} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

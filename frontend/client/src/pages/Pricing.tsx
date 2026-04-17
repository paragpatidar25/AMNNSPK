import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Discount } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Percent, Plus, Trash2, Calculator, Tag, DollarSign } from "lucide-react";

const CALCULATORS = [
  { order: 0, name: "BasePriceCalculator", desc: "Sets working price to product's BasePrice", color: "border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40" },
  { order: 10, name: "TierPriceCalculator", desc: "Applies best tier price for order quantity", color: "border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30" },
  { order: 20, name: "DiscountCalculator", desc: "Applies coupon codes and auto discounts", color: "border-purple-400 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30" },
  { order: 30, name: "TaxCalculator", desc: "Adds 10% tax (or passes through if inclusive)", color: "border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30" },
  { order: 40, name: "CurrencyCalculator", desc: "Converts to requested currency from cache", color: "border-green-400 dark:border-green-700 bg-green-50 dark:bg-green-900/30" },
];

const CURRENCIES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, AUD: 1.54 };

export default function Pricing() {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Percentage", value: "", couponCode: "", active: 1, startDate: "", endDate: "" });

  // Simulator state
  const [sim, setSim] = useState({ basePrice: "100", qty: "1", coupon: "", taxIncluded: true, currency: "USD" });
  const [simResult, setSimResult] = useState<null | { steps: { name: string; price: number }[]; final: number; discount: number; tax: number; currency: string }>(null);

  const { data: discounts = [] } = useQuery<Discount[]>({
    queryKey: ["/api/discounts"],
    queryFn: () => apiRequest("GET", "/api/discounts").then(r => r.json()),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/discounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discounts"] });
      setAddOpen(false);
      setForm({ name: "", type: "Percentage", value: "", couponCode: "", active: 1, startDate: "", endDate: "" });
      toast({ title: "Discount created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/discounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/discounts"] }),
  });

  function runSimulation() {
    let price = parseFloat(sim.basePrice) || 0;
    const steps: { name: string; price: number }[] = [{ name: "Base", price }];

    // Tier price (simulate if qty >= 5, apply 10% off)
    const qty = parseInt(sim.qty) || 1;
    if (qty >= 5) { price = price * 0.90; }
    steps.push({ name: "TierPrice", price: parseFloat(price.toFixed(2)) });

    // Discount
    const matchedDiscount = discounts.find(d =>
      d.active === 1 &&
      (!d.couponCode || d.couponCode.toLowerCase() === sim.coupon.toLowerCase())
    );
    let discountAmt = 0;
    if (matchedDiscount) {
      discountAmt = matchedDiscount.type === "Percentage"
        ? price * matchedDiscount.value / 100
        : Math.min(matchedDiscount.value, price);
      price = Math.max(0, price - discountAmt);
    }
    steps.push({ name: "Discount", price: parseFloat(price.toFixed(2)) });

    // Tax
    let taxAmt = 0;
    if (!sim.taxIncluded) { taxAmt = price * 0.10; price = price * 1.10; }
    steps.push({ name: "Tax", price: parseFloat(price.toFixed(2)) });

    // Currency
    const rate = CURRENCIES[sim.currency] ?? 1;
    price = parseFloat((price * rate).toFixed(2));
    steps.push({ name: "Currency", price });

    setSimResult({ steps, final: price, discount: parseFloat(discountAmt.toFixed(2)), tax: parseFloat(taxAmt.toFixed(2)), currency: sim.currency });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Pricing</h2>
        <p className="text-xs text-muted-foreground mt-0.5">GOE.Pricing module · Smartstore composable pipeline</p>
      </div>

      {/* Pipeline Visualizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator size={15} className="text-primary" />
            IPriceCalculationService Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {CALCULATORS.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className={`calc-step ${c.color} min-w-[120px]`} data-testid={`pipeline-step-${c.order}`}>
                  <div className="text-[10px] font-bold text-muted-foreground mb-1">Order {c.order}</div>
                  <div className="text-xs font-semibold text-foreground leading-tight">{c.name.replace("Calculator", "")}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 leading-snug">{c.desc}</div>
                </div>
                {i < CALCULATORS.length - 1 && (
                  <ArrowRight size={16} className="text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulator + Discounts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Price Simulator */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign size={15} className="text-primary" />
              Price Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1">Base Price (USD)</Label>
                <Input value={sim.basePrice} onChange={e => setSim(s => ({ ...s, basePrice: e.target.value }))} placeholder="100" data-testid="sim-base-price" />
              </div>
              <div>
                <Label className="text-xs mb-1">Quantity</Label>
                <Input value={sim.qty} onChange={e => setSim(s => ({ ...s, qty: e.target.value }))} placeholder="1" data-testid="sim-qty" />
              </div>
              <div>
                <Label className="text-xs mb-1">Coupon Code</Label>
                <Input value={sim.coupon} onChange={e => setSim(s => ({ ...s, coupon: e.target.value }))} placeholder="SAVE20" data-testid="sim-coupon" />
              </div>
              <div>
                <Label className="text-xs mb-1">Currency</Label>
                <Select value={sim.currency} onValueChange={v => setSim(s => ({ ...s, currency: v }))}>
                  <SelectTrigger data-testid="sim-currency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(CURRENCIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="taxIncl" checked={sim.taxIncluded} onChange={e => setSim(s => ({ ...s, taxIncluded: e.target.checked }))} data-testid="sim-tax-inclusive" />
              <Label htmlFor="taxIncl" className="text-xs cursor-pointer">Price is tax-inclusive</Label>
            </div>
            <Button className="w-full" size="sm" onClick={runSimulation} data-testid="btn-run-simulation">
              Run Pipeline
            </Button>

            {simResult && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-xs" data-testid="sim-result">
                <div className="font-semibold text-foreground mb-2">Pipeline Trace</div>
                {simResult.steps.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-mono font-medium">${s.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-destructive font-mono">-${simResult.discount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono">+${simResult.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-sm"><span>Final Price</span><span className="text-primary">{simResult.currency} {simResult.final.toFixed(2)}</span></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discounts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag size={15} className="text-primary" />
                Discounts & Coupons
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddOpen(s => !s)} data-testid="btn-toggle-add-discount">
                <Plus size={13} className="mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {addOpen && (
              <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                {[
                  { label: "Name", key: "name", ph: "Summer Sale" },
                  { label: "Value", key: "value", ph: "10" },
                  { label: "Coupon Code (optional)", key: "couponCode", ph: "SAVE10" },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-xs mb-1">{f.label}</Label>
                    <Input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="h-7 text-xs" data-testid={`discount-input-${f.key}`} />
                  </div>
                ))}
                <div>
                  <Label className="text-xs mb-1">Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage %</SelectItem>
                      <SelectItem value="Flat">Flat Amount $</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" className="w-full" onClick={() => addMutation.mutate({ ...form, value: parseFloat(form.value) || 0 })} disabled={addMutation.isPending} data-testid="btn-save-discount">
                  Save Discount
                </Button>
              </div>
            )}

            {discounts.map(d => (
              <div key={d.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0" data-testid={`row-discount-${d.id}`}>
                <div className={`p-2 rounded-lg shrink-0 ${d.type === "Percentage" ? "bg-purple-100 dark:bg-purple-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                  <Percent size={13} className={d.type === "Percentage" ? "text-purple-600 dark:text-purple-400" : "text-green-600 dark:text-green-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{d.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {d.type === "Percentage" ? `${d.value}% off` : `$${d.value} off`}
                    {d.couponCode && <span className="ml-2 font-mono bg-muted px-1 rounded">{d.couponCode}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge className={`text-[9px] px-1.5 ${d.active ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0" : "bg-muted text-muted-foreground border-0"}`}>
                    {d.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(d.id)} data-testid={`btn-delete-discount-${d.id}`}>
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Currency Rates */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">CurrencyCalculator — Exchange Rates (Cached)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(CURRENCIES).map(([code, rate]) => (
              <div key={code} className="rounded-lg border border-border p-3 text-center" data-testid={`currency-rate-${code}`}>
                <div className="text-lg font-bold text-foreground">{code}</div>
                <div className="text-xs text-muted-foreground mt-0.5">1 USD = {rate} {code}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

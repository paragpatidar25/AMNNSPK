import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search, Trash2, Plus, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Electronics", "Accessories", "Furniture", "Apparel", "Other"];
const PRODUCT_TYPES = ["SimpleProduct", "GroupedProduct", "BundledProduct", "DigitalProduct", "RecurringProduct"];

export default function Catalog() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "Electronics", price: "", stock: "", status: "Published", productType: "SimpleProduct" });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => apiRequest("GET", "/api/products").then(r => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/products"] }); toast({ title: "Product deleted" }); },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setAddOpen(false);
      setForm({ name: "", sku: "", category: "Electronics", price: "", stock: "", status: "Published", productType: "SimpleProduct" });
      toast({ title: "Product added" });
    },
  });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter(p => p.stock < 5);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">Catalog</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{products.length} products · GOE.Catalog module</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} data-testid="btn-add-product">
          <Plus size={14} className="mr-1" /> Add Product
        </Button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <TrendingDown size={15} />
          <span><strong>{lowStock.length}</strong> product{lowStock.length > 1 ? "s" : ""} low or out of stock</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, SKU, or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8"
          data-testid="input-catalog-search"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))
                  : filtered.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors" data-testid={`row-product-${p.id}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{p.productType}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className={p.stock === 0 ? "text-destructive font-semibold" : p.stock < 10 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-foreground"}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge className={p.status === "Published" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0 text-xs"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMutation.mutate(p.id)}
                          data-testid={`btn-delete-product-${p.id}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </td>
                    </tr>
                  ))
                }
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            {[
              { label: "Name", key: "name", placeholder: "e.g. Wireless Keyboard" },
              { label: "SKU", key: "sku", placeholder: "e.g. KBD-009" },
              { label: "Price", key: "price", placeholder: "0.00" },
              { label: "Stock", key: "stock", placeholder: "0" },
            ].map(f => (
              <div key={f.key}>
                <Label className="text-xs mb-1">{f.label}</Label>
                <Input
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  data-testid={`input-${f.key}`}
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1">Type</Label>
                <Select value={form.productType} onValueChange={v => setForm(p => ({ ...p, productType: v }))}>
                  <SelectTrigger data-testid="select-product-type"><SelectValue /></SelectTrigger>
                  <SelectContent>{PRODUCT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => addMutation.mutate({ ...form, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0 })}
              disabled={addMutation.isPending}
              data-testid="btn-confirm-add-product"
            >
              {addMutation.isPending ? "Adding…" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

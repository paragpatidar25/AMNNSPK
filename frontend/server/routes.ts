import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertCustomerSchema, insertDiscountSchema } from "@shared/schema";
import { z } from "zod";

// Seed demo data on startup
function seedData() {
  const existing = storage.getProducts();
  if (existing.length > 0) return;

  const now = new Date().toISOString();

  // Products
  const productData = [
    { name: "GOE Pro Keyboard", sku: "KBD-001", category: "Electronics", price: 149.99, stock: 42, status: "Published", productType: "SimpleProduct" },
    { name: "Ergonomic Mouse", sku: "MSE-002", category: "Electronics", price: 79.00, stock: 18, status: "Published", productType: "SimpleProduct" },
    { name: "Desk Mat XL", sku: "MAT-003", category: "Accessories", price: 39.99, stock: 65, status: "Published", productType: "SimpleProduct" },
    { name: "USB-C Hub 7-in-1", sku: "HUB-004", category: "Electronics", price: 59.99, stock: 0, status: "Draft", productType: "SimpleProduct" },
    { name: "Cable Management Kit", sku: "CBL-005", category: "Accessories", price: 24.99, stock: 120, status: "Published", productType: "BundledProduct" },
    { name: "Monitor Stand", sku: "STD-006", category: "Furniture", price: 89.00, stock: 30, status: "Published", productType: "SimpleProduct" },
    { name: "LED Strip 2m", sku: "LED-007", category: "Accessories", price: 29.99, stock: 200, status: "Published", productType: "SimpleProduct" },
    { name: "Wireless Charger", sku: "WCH-008", category: "Electronics", price: 44.99, stock: 55, status: "Published", productType: "SimpleProduct" },
  ];
  productData.forEach(p => storage.createProduct(p));

  // Orders
  const orderData = [
    { customerEmail: "alice@example.com", total: 229.98, currency: "USD", orderStatus: "Complete", paymentStatus: "Paid", shippingStatus: "Delivered", paymentMethod: "Payments.Stripe", createdAt: "2026-04-10T08:22:00Z", isGuest: 0 },
    { customerEmail: "bob@example.com", total: 79.00, currency: "USD", orderStatus: "Processing", paymentStatus: "Paid", shippingStatus: "Shipped", paymentMethod: "Payments.Stripe", createdAt: "2026-04-12T14:05:00Z", isGuest: 0 },
    { customerEmail: "guest@shop.com", total: 39.99, currency: "USD", orderStatus: "Pending", paymentStatus: "Pending", shippingStatus: "NotYetShipped", paymentMethod: "Payments.PayPal", createdAt: "2026-04-15T09:11:00Z", isGuest: 1 },
    { customerEmail: "carol@example.com", total: 148.99, currency: "EUR", orderStatus: "Processing", paymentStatus: "Authorized", shippingStatus: "NotYetShipped", paymentMethod: "Payments.Stripe", createdAt: "2026-04-16T11:43:00Z", isGuest: 0 },
    { customerEmail: "dave@example.com", total: 44.99, currency: "USD", orderStatus: "Cancelled", paymentStatus: "Refunded", shippingStatus: "ShippingNotRequired", paymentMethod: "Payments.Stripe", createdAt: "2026-04-14T18:00:00Z", isGuest: 0 },
    { customerEmail: "eve@example.com", total: 174.97, currency: "USD", orderStatus: "Complete", paymentStatus: "Paid", shippingStatus: "Delivered", paymentMethod: "Payments.PayPal", createdAt: "2026-04-09T07:30:00Z", isGuest: 0 },
  ];
  orderData.forEach(o => storage.createOrder(o));

  // Customers
  const customerData = [
    { email: "alice@example.com", firstName: "Alice", lastName: "Walker", role: "Registered", active: 1, failedLogins: 0, registeredAt: "2025-11-01T00:00:00Z", lastLogin: "2026-04-16T08:00:00Z" },
    { email: "bob@example.com", firstName: "Bob", lastName: "Smith", role: "Registered", active: 1, failedLogins: 2, registeredAt: "2025-12-15T00:00:00Z", lastLogin: "2026-04-12T14:00:00Z" },
    { email: "carol@example.com", firstName: "Carol", lastName: "Jones", role: "Registered", active: 1, failedLogins: 0, registeredAt: "2026-01-20T00:00:00Z", lastLogin: "2026-04-16T11:30:00Z" },
    { email: "admin@goe.com", firstName: "Super", lastName: "Admin", role: "Administrators", active: 1, failedLogins: 0, registeredAt: "2025-01-01T00:00:00Z", lastLogin: "2026-04-17T13:00:00Z" },
    { email: "dave@example.com", firstName: "Dave", lastName: "Green", role: "Registered", active: 0, failedLogins: 5, registeredAt: "2026-02-10T00:00:00Z", lastLogin: "2026-04-14T17:00:00Z" },
    { email: "vendor@shop.com", firstName: "Vendor", lastName: "One", role: "Vendors", active: 1, failedLogins: 0, registeredAt: "2025-09-01T00:00:00Z", lastLogin: "2026-04-17T10:00:00Z" },
  ];
  customerData.forEach(c => storage.createCustomer(c));

  // Discounts
  const discountData = [
    { name: "Summer Sale 10%", type: "Percentage", value: 10, couponCode: null, active: 1, startDate: "2026-04-01", endDate: "2026-04-30" },
    { name: "Flat $20 Off", type: "Flat", value: 20, couponCode: "SAVE20", active: 1, startDate: null, endDate: null },
    { name: "VIP 15%", type: "Percentage", value: 15, couponCode: "VIP15", active: 0, startDate: "2026-05-01", endDate: "2026-05-31" },
  ];
  discountData.forEach(d => storage.createDiscount(d));

  // GitHub Issues (pre-seeded from our real issues)
  const issues = [
    { id: 1, title: "[Integration Tests] AuthController — POST /api/auth/register & /api/auth/login", body: "", state: "open", labels: JSON.stringify(["testing", "integration-test", "identity"]), url: "https://github.com/paragpatidar25/AMNNSPK/issues/1", createdAt: now, checkboxTotal: 17, checkboxChecked: 0 },
    { id: 2, title: "[Integration Tests] GoeSignInManager — PasswordSignInAsync & ExternalLoginAsync", body: "", state: "open", labels: JSON.stringify(["testing", "integration-test", "identity"]), url: "https://github.com/paragpatidar25/AMNNSPK/issues/2", createdAt: now, checkboxTotal: 14, checkboxChecked: 0 },
    { id: 3, title: "[Integration Tests] CheckoutService — CheckoutAsync (price recalculation + order placement)", body: "", state: "open", labels: JSON.stringify(["testing", "integration-test", "orders"]), url: "https://github.com/paragpatidar25/AMNNSPK/issues/3", createdAt: now, checkboxTotal: 14, checkboxChecked: 0 },
    { id: 4, title: "[Integration Tests] PriceCalculationService — Full 5-step calculator pipeline", body: "", state: "open", labels: JSON.stringify(["testing", "integration-test", "pricing"]), url: "https://github.com/paragpatidar25/AMNNSPK/issues/4", createdAt: now, checkboxTotal: 20, checkboxChecked: 0 },
    { id: 5, title: "[Integration Tests] Individual Calculators — TierPriceCalculator, DiscountCalculator, TaxCalculator, CurrencyCalculator", body: "", state: "open", labels: JSON.stringify(["testing", "integration-test", "pricing"]), url: "https://github.com/paragpatidar25/AMNNSPK/issues/5", createdAt: now, checkboxTotal: 27, checkboxChecked: 0 },
  ];
  issues.forEach(i => storage.upsertIssue(i));
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  seedData();

  // Products
  app.get("/api/products", (_req, res) => res.json(storage.getProducts()));
  app.post("/api/products", (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(storage.createProduct(parsed.data));
  });
  app.delete("/api/products/:id", (req, res) => {
    storage.deleteProduct(Number(req.params.id));
    res.json({ ok: true });
  });

  // Orders
  app.get("/api/orders", (_req, res) => res.json(storage.getOrders()));
  app.patch("/api/orders/:id/status", (req, res) => {
    const updated = storage.updateOrderStatus(Number(req.params.id), req.body.status);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  // Customers
  app.get("/api/customers", (_req, res) => res.json(storage.getCustomers()));

  // Discounts
  app.get("/api/discounts", (_req, res) => res.json(storage.getDiscounts()));
  app.post("/api/discounts", (req, res) => {
    const parsed = insertDiscountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(storage.createDiscount(parsed.data));
  });
  app.delete("/api/discounts/:id", (req, res) => {
    storage.deleteDiscount(Number(req.params.id));
    res.json({ ok: true });
  });

  // GitHub Issues
  app.get("/api/issues", (_req, res) => res.json(storage.getIssues()));

  // Stats
  app.get("/api/stats", (_req, res) => {
    const prods = storage.getProducts();
    const ords = storage.getOrders();
    const custs = storage.getCustomers();
    const revenue = ords.filter(o => o.orderStatus === "Complete").reduce((s, o) => s + o.total, 0);
    const pending = ords.filter(o => o.orderStatus === "Pending").length;
    const processing = ords.filter(o => o.orderStatus === "Processing").length;
    const issues = storage.getIssues();
    const totalTests = issues.reduce((s, i) => s + i.checkboxTotal, 0);
    res.json({
      totalProducts: prods.length,
      totalOrders: ords.length,
      totalCustomers: custs.length,
      revenue: revenue.toFixed(2),
      pendingOrders: pending,
      processingOrders: processing,
      totalTests,
      openIssues: issues.filter(i => i.state === "open").length,
    });
  });
}

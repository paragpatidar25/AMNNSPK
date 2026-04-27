import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Products ────────────────────────────────────────────
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  status: text("status").notNull().default("Published"), // Published | Draft
  productType: text("product_type").notNull().default("SimpleProduct"),
});
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// ── Orders ──────────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerEmail: text("customer_email").notNull(),
  total: real("total").notNull(),
  currency: text("currency").notNull().default("USD"),
  orderStatus: text("order_status").notNull().default("Pending"),
  paymentStatus: text("payment_status").notNull().default("Pending"),
  shippingStatus: text("shipping_status").notNull().default("NotYetShipped"),
  paymentMethod: text("payment_method").notNull().default("Payments.Stripe"),
  createdAt: text("created_at").notNull(),
  isGuest: integer("is_guest").notNull().default(0),
});
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// ── Customers ───────────────────────────────────────────
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("Registered"),
  active: integer("active").notNull().default(1),
  failedLogins: integer("failed_logins").notNull().default(0),
  registeredAt: text("registered_at").notNull(),
  lastLogin: text("last_login"),
});
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// ── Discounts ───────────────────────────────────────────
export const discounts = sqliteTable("discounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull().default("Percentage"), // Percentage | Flat
  value: real("value").notNull(),
  couponCode: text("coupon_code"),
  active: integer("active").notNull().default(1),
  startDate: text("start_date"),
  endDate: text("end_date"),
});
export const insertDiscountSchema = createInsertSchema(discounts).omit({ id: true });
export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type Discount = typeof discounts.$inferSelect;

// ── GitHub Issues (cached) ──────────────────────────────
export const githubIssues = sqliteTable("github_issues", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  state: text("state").notNull().default("open"),
  labels: text("labels").notNull().default("[]"),
  url: text("url").notNull(),
  createdAt: text("created_at").notNull(),
  checkboxTotal: integer("checkbox_total").notNull().default(0),
  checkboxChecked: integer("checkbox_checked").notNull().default(0),
});
export type GithubIssue = typeof githubIssues.$inferSelect;

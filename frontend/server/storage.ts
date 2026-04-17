import { db } from "./db";
import { products, orders, customers, discounts, githubIssues } from "@shared/schema";
import type { Product, InsertProduct, Order, InsertOrder, Customer, InsertCustomer, Discount, InsertDiscount, GithubIssue } from "@shared/schema";
import { eq, desc, like, or } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Product[];
  getProduct(id: number): Product | undefined;
  createProduct(data: InsertProduct): Product;
  updateProduct(id: number, data: Partial<InsertProduct>): Product | undefined;
  deleteProduct(id: number): void;

  // Orders
  getOrders(): Order[];
  getOrder(id: number): Order | undefined;
  createOrder(data: InsertOrder): Order;
  updateOrderStatus(id: number, status: string): Order | undefined;

  // Customers
  getCustomers(): Customer[];
  getCustomer(id: number): Customer | undefined;
  createCustomer(data: InsertCustomer): Customer;

  // Discounts
  getDiscounts(): Discount[];
  createDiscount(data: InsertDiscount): Discount;
  deleteDiscount(id: number): void;

  // GitHub Issues
  getIssues(): GithubIssue[];
  upsertIssue(issue: GithubIssue): void;
}

export class DatabaseStorage implements IStorage {
  // Products
  getProducts() { return db.select().from(products).orderBy(desc(products.id)).all(); }
  getProduct(id: number) { return db.select().from(products).where(eq(products.id, id)).get(); }
  createProduct(data: InsertProduct) { return db.insert(products).values(data).returning().get(); }
  updateProduct(id: number, data: Partial<InsertProduct>) {
    return db.update(products).set(data).where(eq(products.id, id)).returning().get();
  }
  deleteProduct(id: number) { db.delete(products).where(eq(products.id, id)).run(); }

  // Orders
  getOrders() { return db.select().from(orders).orderBy(desc(orders.id)).all(); }
  getOrder(id: number) { return db.select().from(orders).where(eq(orders.id, id)).get(); }
  createOrder(data: InsertOrder) { return db.insert(orders).values(data).returning().get(); }
  updateOrderStatus(id: number, status: string) {
    return db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id)).returning().get();
  }

  // Customers
  getCustomers() { return db.select().from(customers).orderBy(desc(customers.id)).all(); }
  getCustomer(id: number) { return db.select().from(customers).where(eq(customers.id, id)).get(); }
  createCustomer(data: InsertCustomer) { return db.insert(customers).values(data).returning().get(); }

  // Discounts
  getDiscounts() { return db.select().from(discounts).all(); }
  createDiscount(data: InsertDiscount) { return db.insert(discounts).values(data).returning().get(); }
  deleteDiscount(id: number) { db.delete(discounts).where(eq(discounts.id, id)).run(); }

  // GitHub Issues
  getIssues() { return db.select().from(githubIssues).orderBy(githubIssues.id).all(); }
  upsertIssue(issue: GithubIssue) {
    db.insert(githubIssues).values(issue)
      .onConflictDoUpdate({ target: githubIssues.id, set: { title: issue.title, body: issue.body, state: issue.state, labels: issue.labels, checkboxTotal: issue.checkboxTotal, checkboxChecked: issue.checkboxChecked } })
      .run();
  }
}

export const storage = new DatabaseStorage();

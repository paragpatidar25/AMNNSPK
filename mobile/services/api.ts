/**
 * GOE Mobile — API Service
 * Connects to GOE backend (Express + SQLite) or ASP.NET Core API
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore unavailable on web — continue without auth header
  }
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      } catch { /* ignore */ }
    }
    return Promise.reject(error);
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: string;
  pendingOrders: number;
  processingOrders: number;
  totalTests: number;
  openIssues: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'Published' | 'Draft' | 'Archived';
  productType: string;
}

export interface Order {
  id: number;
  customerEmail: string;
  total: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  paymentMethod: string;
  createdAt: string;
  isGuest: number;
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: number;
  failedLogins: number;
  registeredAt: string;
  lastLogin: string;
}

export interface Discount {
  id: number;
  name: string;
  type: 'Percentage' | 'Flat';
  value: number;
  couponCode: string | null;
  active: number;
  startDate: string | null;
  endDate: string | null;
}

export interface GitHubIssue {
  id: number;
  title: string;
  state: string;
  labels: string;
  url: string;
  createdAt: string;
  checkboxTotal: number;
  checkboxChecked: number;
}

export interface InsertProduct {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  productType: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  customerId: number;
  email: string;
  role: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (data: AuthRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: AuthRequest & { firstName: string; lastName: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  // Dashboard
  getStats: () =>
    apiClient.get<DashboardStats>('/stats').then((r) => r.data),

  // Products
  getProducts: () =>
    apiClient.get<Product[]>('/products').then((r) => r.data),

  createProduct: (data: InsertProduct) =>
    apiClient.post<Product>('/products', data).then((r) => r.data),

  deleteProduct: (id: number) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),

  // Orders
  getOrders: () =>
    apiClient.get<Order[]>('/orders').then((r) => r.data),

  updateOrderStatus: (id: number, orderStatus: string) =>
    apiClient.patch<Order>(`/orders/${id}/status`, { orderStatus }).then((r) => r.data),

  // Customers
  getCustomers: () =>
    apiClient.get<Customer[]>('/customers').then((r) => r.data),

  // Discounts
  getDiscounts: () =>
    apiClient.get<Discount[]>('/discounts').then((r) => r.data),

  createDiscount: (data: Omit<Discount, 'id'>) =>
    apiClient.post<Discount>('/discounts', data).then((r) => r.data),

  deleteDiscount: (id: number) =>
    apiClient.delete(`/discounts/${id}`).then((r) => r.data),

  // GitHub Issues
  getIssues: () =>
    apiClient.get<GitHubIssue[]>('/issues').then((r) => r.data),

  // Price calculation simulation
  runPipeline: (body: {
    basePrice: number;
    quantity: number;
    couponCode?: string;
    currency: string;
    isTaxInclusive: boolean;
  }) => apiClient.post<{ steps: { name: string; price: number }[]; finalPrice: number }>('/pricing/simulate', body).then((r) => r.data),
};

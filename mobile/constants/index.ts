// GOE Mobile — Constants

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

export const Colors = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  sidebar: '#0f172a',
  background: '#f1f5f9',
  surface: '#ffffff',
  surfaceDark: '#1e293b',
  text: '#0f172a',
  textMuted: '#64748b',
  textInverse: '#ffffff',
  border: '#e2e8f0',
  borderDark: '#334155',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Status colors
  statusComplete: '#22c55e',
  statusProcessing: '#3b82f6',
  statusPending: '#f59e0b',
  statusCancelled: '#ef4444',
  statusShipped: '#8b5cf6',
  statusDelivered: '#10b981',
};

export const OrderStatusColors: Record<string, string> = {
  Complete: Colors.statusComplete,
  Processing: Colors.statusProcessing,
  Pending: Colors.statusPending,
  Cancelled: Colors.statusCancelled,
};

export const PaymentStatusColors: Record<string, string> = {
  Paid: Colors.statusComplete,
  Authorized: Colors.statusProcessing,
  Pending: Colors.statusPending,
  Refunded: Colors.statusCancelled,
  Voided: Colors.textMuted,
};

export const ShippingStatusColors: Record<string, string> = {
  Delivered: Colors.statusDelivered,
  Shipped: Colors.statusShipped,
  NotYetShipped: Colors.statusPending,
  ShippingNotRequired: Colors.textMuted,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'goe_auth_token',
  REFRESH_TOKEN: 'goe_refresh_token',
  USER_EMAIL: 'goe_user_email',
  THEME: 'goe_theme',
};

export const QUERY_KEYS = {
  STATS: ['stats'],
  PRODUCTS: ['products'],
  ORDERS: ['orders'],
  CUSTOMERS: ['customers'],
  DISCOUNTS: ['discounts'],
  ISSUES: ['issues'],
};

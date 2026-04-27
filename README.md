# GOE — Global Order Engine

> Full-stack e-commerce platform · DDD Modular Monolith · ASP.NET Core 10 · React · React Native

[![Branch](https://img.shields.io/badge/branch-copilot%2Fecommerce--project--backend--api-blue)](https://github.com/paragpatidar25/AMNNSPK/tree/copilot/ecommerce-project-backend-api)
[![Issues](https://img.shields.io/badge/open%20issues-5-red)](https://github.com/paragpatidar25/AMNNSPK/issues)
[![Tests](https://img.shields.io/badge/test%20cases-92-green)](https://github.com/paragpatidar25/AMNNSPK/issues)

---

## Repository Structure

```
AMNNSPK/
├── backend/          # ASP.NET Core 10 Web API — DDD Modular Monolith
│   └── src/
│       ├── GOE.Api/           # Entry point, middleware, module loader
│       ├── GOE.Shared/        # Cross-cutting abstractions and domain primitives
│       └── Modules/           # 10 feature modules (see below)
├── frontend/         # React + Express + Vite + Tailwind CSS admin dashboard
│   ├── client/        # React 18 SPA
│   └── server/        # Express REST API + SQLite (Drizzle ORM)
└── mobile/           # React Native + Expo Router mobile app
    ├── app/           # Expo Router file-based screens
    ├── components/    # Shared UI components
    ├── hooks/         # useAuth, useTheme
    └── services/      # API client (Axios + TanStack Query)
```

---

## Backend (`/backend`)

### Architecture
- **Pattern**: DDD Modular Monolith inspired by Smartstore & nopCommerce
- **Framework**: ASP.NET Core 10, Entity Framework Core
- **Auth**: ASP.NET Core Identity + JWT Bearer (HMAC-SHA256)
- **CQRS**: MediatR — Commands, Queries, Domain Events
- **Scheduler**: Quartz.NET for background tasks

### Modules

| Module | Namespace | Description |
|--------|-----------|-------------|
| **Identity** | `GOE.Identity` | Customer aggregate, JWT auth, ACL, WorkContext, StoreContext, GoeSignInManager |
| **Catalog** | `GOE.Catalog` | Product (nopCommerce fields), Category, Manufacturer, Attributes, TierPrices, Reviews |
| **Pricing** | `GOE.Pricing` | IPriceCalculationService — 5-step composable pipeline (Base→Tier→Discount→Tax→Currency) |
| **Order** | `GOE.Order` | Order, OrderItem, Shipment, ReturnRequest, CheckoutService, PlaceOrderCommand |
| **Payment** | `GOE.Payment` | IPaymentMethod, PaymentTransaction, PaymentWebhookLog |
| **Inventory** | `GOE.Inventory` | StockItem, Warehouse, StockMovement |
| **Shipping** | `GOE.Shipping` | IShippingRateProvider, ShippingMethod |
| **Vendor** | `GOE.Vendor` | Vendor, VendorCommissionRule, VendorPayoutRecord |
| **MultiStore** | `GOE.MultiStore` | Store, StoreSettingOverride |
| **Notification** | `GOE.Notification` | Liquid template engine, QueuedEmail, IEmailSender, ISmsSender |

### Key Endpoints

```
POST /api/auth/register    → RegisterCustomerCommand → CustomerRegisteredEvent
POST /api/auth/login       → GoeSignInManager.PasswordSignInAsync → JWT token
GET  /api/catalog/products → ListProductsQuery → PagedResult<Product>
POST /api/orders/checkout  → CheckoutService.CheckoutAsync → PlaceOrderCommand
GET  /api/pricing/calculate→ PriceCalculationService (5-step pipeline)
```

### Running the Backend
```bash
cd backend/src/GOE.Api
dotnet restore
dotnet run
# API available at https://localhost:5001
```

---

## Frontend (`/frontend`)

**Live Demo**: [GOE Admin Dashboard](https://www.perplexity.ai/computer/a/goe-admin-dashboard-7b.vYIE8S26X08tl8N1JQg)

### Stack
| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + TypeScript |
| Routing | wouter (hash routing — iframe-safe) |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State / Fetching | TanStack Query v5 |
| Charts | Recharts |
| Backend | Express.js + better-sqlite3 + Drizzle ORM |
| Build | Vite 7 |

### Pages

| Route | Description |
|-------|-------------|
| `/` | **Dashboard** — KPI cards, Revenue Trend chart, Order Status donut, GitHub Issues panel, Recent Orders, Backend Modules |
| `/#/catalog` | **Catalog** — Product table, search, Add Product dialog, low-stock alert |
| `/#/orders` | **Orders** — Order list, filter tabs, status badges (Order/Payment/Shipping), inline status update |
| `/#/pricing` | **Pricing** — 5-step pipeline visualizer, Price Simulator (client-side), Discounts CRUD, Currency rates |
| `/#/identity` | **Identity** — Role breakdown, Customer table with lockout, App Services, Domain Events |
| `/#/issues` | **Issues** — GitHub Issues #1–5 with 92 test checklists, progress bars, GitHub links |

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5000
```

### Building for Production
```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

---

## Mobile (`/mobile`)

### Stack
| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.76 + Expo SDK 52 |
| Routing | Expo Router v4 (file-based, tab navigation) |
| State / Fetching | TanStack Query v5 |
| HTTP | Axios |
| Auth Storage | expo-secure-store (JWT) |
| Forms | react-hook-form + zod |
| Icons | @expo/vector-icons (Ionicons) |

### Screens

| Screen | File | Description |
|--------|------|-------------|
| Dashboard | `app/tabs/index.tsx` | KPIs, Recent Orders, GitHub Issues, Backend Modules |
| Catalog | `app/tabs/catalog.tsx` | Product list, search, Add modal, delete |
| Orders | `app/tabs/orders.tsx` | Filter tabs, card list, inline status update |
| Pricing | `app/tabs/pricing.tsx` | Pipeline visualizer, Price Simulator, Discounts, FX rates |
| Identity | `app/tabs/identity.tsx` | Role cards, customers, App Services, Domain Events |
| Issues | `app/tabs/issues.tsx` | GitHub Issues #1-5, progress bars, deep links |
| Login | `app/auth/login.tsx` | JWT auth → GOE.Identity AuthController |

### Running the Mobile App
```bash
cd mobile
npm install
cp .env.example .env   # Set EXPO_PUBLIC_API_URL=http://<your-ip>:5000
npx expo start
# Scan QR code with Expo Go on iOS/Android
```

### Building with EAS
```bash
npm install -g eas-cli
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

---

## GitHub Issues — Integration Test Checklist

| # | Title | Tests | Labels |
|---|-------|-------|--------|
| [#1](https://github.com/paragpatidar25/AMNNSPK/issues/1) | AuthController — register & login | 17 | identity, integration-test |
| [#2](https://github.com/paragpatidar25/AMNNSPK/issues/2) | GoeSignInManager — PasswordSignIn & ExternalLogin | 14 | identity, integration-test |
| [#3](https://github.com/paragpatidar25/AMNNSPK/issues/3) | CheckoutService — CheckoutAsync | 14 | orders, integration-test |
| [#4](https://github.com/paragpatidar25/AMNNSPK/issues/4) | PriceCalculationService — Full 5-step pipeline | 20 | pricing, integration-test |
| [#5](https://github.com/paragpatidar25/AMNNSPK/issues/5) | Individual Calculators (Tier/Discount/Tax/Currency) | 27 | pricing, integration-test |
| **Total** | | **92** | |

---

## Design Principles

- **DDD** — Each module owns its domain entities, repositories, and application services
- **CQRS** — Commands mutate state, Queries return projections, both via MediatR
- **Composable Pricing** — `IPriceCalculator` implementations registered by DI, sorted by `Order` property, executed in pipeline
- **nopCommerce patterns** — ACL, Customer roles, Reward Points, GDPR consent, Activity logging
- **Smartstore patterns** — `IWorkContext`, `IStoreContext`, `IModule`, `IScheduledTask`, Liquid notification templates
- **JWT + Role ACL** — Administrators bypass all permission checks; other roles go through `IPermissionService`

---

## Contributing

1. Fork the repository
2. Create a feature branch off `copilot/ecommerce-project-backend-api`
3. Write tests (see Issues #1–5 for integration test specs)
4. Submit a Pull Request

---

*Generated by GOE Ecommerce Project · Branch: `copilot/ecommerce-project-backend-api`*

# AMNNSPK — GOE (Global Order Engine)

<div align="center">

```
   ██████╗  ██████╗ ███████╗
  ██╔════╝ ██╔═══██╗██╔════╝
  ██║  ███╗██║   ██║█████╗
  ██║   ██║██║   ██║██╔══╝
  ╚██████╔╝╚██████╔╝███████╗
   ╚═════╝  ╚═════╝ ╚══════╝
  Global Order Engine — Enterprise E-Commerce Platform
```

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs)
![MAUI](https://img.shields.io/badge/.NET_MAUI-10.0-512BD4?style=flat-square&logo=dotnet)
![EF Core](https://img.shields.io/badge/EF_Core-10.0-512BD4?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Architecture](https://img.shields.io/badge/Architecture-DDD_+_Modular_Bundles-blue?style=flat-square)

**Architecture Pattern:** DDD + Modular Bundles  
**Inspired by:** [Smartstore Framework](https://dev.smartstore.com/framework/platform/identity) · [nopCommerce Docs](https://docs.nopcommerce.com/en/index.html)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Reference Architecture](#-reference-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
  - [Backend (.NET 10)](#backend-net-10-web-api)
  - [Frontend (Vue 3)](#frontend-vue-3--vite-spa)
  - [Mobile (.NET MAUI)](#mobile-net-maui)
  - [Plugins](#plugins)
  - [Themes](#themes)
  - [Docker](#docker)
  - [Scripts](#scripts)
  - [Docs](#docs)
- [Module Bundle Map](#-module-bundle-map)
- [Database Support](#-database-support)
- [Key Design Patterns](#-key-design-patterns)
  - [IWorkContext & IStoreContext](#iworkcontext--istorecontext-smartstore)
  - [GoeSignInManager](#goesigninmanager-smartstore)
  - [IExternalAuthenticationMethod](#iexternalauthenticationmethod-smartstore)
  - [IPermissionService & ACL](#ipermissionservice--acl-nopcommerce--smartstore)
  - [Rules Engine](#rules-engine-smartstore)
  - [Liquid Templates & PDF](#liquid-templates--html-to-pdf-smartstore)
  - [Plugin Lifecycle](#plugin-lifecycle-nopcommerce--smartstore)
  - [Multi-Store & Multi-Vendor](#multi-store--multi-vendor-nopcommerce)
  - [Tier Pricing & Discounts](#tier-pricing--discounts-nopcommerce)
  - [Reward Points & Gift Cards](#reward-points--gift-cards-nopcommerce)
  - [Guest Checkout](#guest-checkout-nopcommerce)
  - [DeleteGuestsTask](#deletegueststask-smartstore)
- [Installation Service](#-installation-service)
- [Configuration Reference](#-configuration-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Mobile Setup](#mobile-setup)
  - [Docker Compose](#docker-compose-all-services)
- [Feature Parity Matrix](#-feature-parity-matrix)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 About

**GOE (Global Order Engine)** is an enterprise-grade, cloud-native e-commerce platform built on **.NET 10**, **Vue 3**, and **.NET MAUI**. It is architected using **Domain-Driven Design (DDD) with a Modular Bundle** strategy — synthesising the best patterns from two industry-leading open-source .NET platforms:

| Platform | Reference | Key Contributions |
|---|---|---|
| **Smartstore** | [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) | IWorkContext, SmartSignInManager, Rules Engine, Liquid Templates, HTML-to-PDF, Theme Inheritance, Modularity Engine, DeleteGuestsTask |
| **nopCommerce** | [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) | Multi-Store, Multi-Vendor, 50+ Payment Gateways, Tier Pricing, Reward Points, Gift Cards, ACL, Guest Checkout, Plugin Lifecycle, Return Requests |

GOE is a **fully owned codebase** — not a fork. It targets global commerce at any scale across **web, mobile, and API channels**.

---

## 📚 Reference Architecture

> Every module in GOE maps to documented patterns from both reference platforms.  
> Sections below cite the specific URL and pattern used.

```
┌─────────────────────────────────────────────────────────────────┐
│  Ref: https://dev.smartstore.com/framework/platform/identity    │
│  Ref: https://docs.nopcommerce.com/en/index.html               │
├─────────────────────────────────────────────────────────────────┤
│                   GOE Architecture Layers                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Presentation Layer                    │  │
│  │   Vue 3 SPA  ·  ASP.NET Core API  ·  .NET MAUI App      │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                   Application Layer                      │  │
│  │      Commands / Queries (MediatR CQRS)  ·  DTOs          │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                     Domain Layer                         │  │
│  │   Entities · Aggregates · Domain Events · Repositories   │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                 Infrastructure Layer                     │  │
│  │   EF Core · FluentMigrator · Payment Adapters · Search   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Concern | Technology |
|---|---|
| Framework | ASP.NET Core 10 (Minimal APIs + Controllers) |
| ORM | Entity Framework Core 10 |
| Migrations | FluentMigrator |
| Validation | FluentValidation |
| Auth | ASP.NET Identity + JWT Bearer |
| CQRS | MediatR 12 |
| Templates | Fluid (Liquid-compatible — Smartstore pattern) |
| PDF Generation | Playwright headless Chrome (Smartstore HTML-to-PDF) |
| Search | Elastic.Clients.Elasticsearch 8.x |
| Cache | IMemoryCache + Redis (StackExchange.Redis) |
| Messaging | MassTransit + RabbitMQ |
| Scheduling | Quartz.NET |
| Logging | Serilog + Seq |
| API Docs | Scalar / Swagger (OpenAPI 3.x) |
| Testing | xUnit + Moq + TestContainers |

### Frontend
| Concern | Library |
|---|---|
| Build | Vite 6 |
| Framework | Vue 3 (Composition API + TypeScript) |
| Router | Vue Router 4 |
| State | Pinia |
| HTTP | Axios |
| Styling | Tailwind CSS 4 |
| Forms | VeeValidate + Zod |
| i18n | vue-i18n (300+ language packs) |
| Testing | Vitest + Vue Test Utils |

### Mobile
| Concern | Technology |
|---|---|
| Framework | .NET MAUI 10 |
| Targets | Android · iOS · Windows |
| HTTP | IHttpClientFactory |
| Auth Storage | SecureStorage |
| Pattern | MVVM (ViewModel + Page) |

---

## 📁 Repository Structure

```
AMNNSPK/
│
├── 📂 backend/                        ← .NET 10 Web API
│   ├── GOE.sln
│   ├── src/
│   │   ├── GOE.Api/                   ← ASP.NET Core 10 Entry Point
│   │   │   ├── Program.cs
│   │   │   ├── ModuleLoader.cs
│   │   │   ├── Middleware/
│   │   │   │   ├── InstallationGuardMiddleware.cs
│   │   │   │   └── WebhookEndpointMiddleware.cs
│   │   │   └── appsettings.json
│   │   │
│   │   ├── GOE.Shared/                ← Cross-cutting abstractions
│   │   │   ├── Abstractions/
│   │   │   │   ├── IWorkContext.cs
│   │   │   │   ├── IStoreContext.cs
│   │   │   │   ├── IPermissionService.cs
│   │   │   │   ├── IScheduledTask.cs
│   │   │   │   └── IModule.cs
│   │   │   ├── Domain/
│   │   │   │   ├── BaseEntity.cs
│   │   │   │   └── AuditableEntity.cs
│   │   │   └── Results/
│   │   │       ├── Result.cs
│   │   │       └── PagedResult.cs
│   │   │
│   │   └── Modules/
│   │       │
│   │       ├── 📦 Identity/           ← Smartstore IWorkContext + nopCommerce ACL
│   │       │   ├── GOE.Identity.Domain/
│   │       │   │   ├── Entities/
│   │       │   │   │   ├── Customer.cs
│   │       │   │   │   ├── CustomerRole.cs
│   │       │   │   │   ├── CustomerAddress.cs
│   │       │   │   │   ├── ExternalAuthenticationRecord.cs
│   │       │   │   │   ├── RewardPointsHistory.cs
│   │       │   │   │   ├── ActivityLog.cs
│   │       │   │   │   └── GdprConsent.cs
│   │       │   │   ├── Events/
│   │       │   │   │   ├── CustomerLoggedInEvent.cs
│   │       │   │   │   ├── CustomerRegisteredEvent.cs
│   │       │   │   │   └── PasswordChangedEvent.cs
│   │       │   │   └── Repositories/
│   │       │   │       └── ICustomerRepository.cs
│   │       │   ├── GOE.Identity.Application/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── RegisterCustomerCommand.cs
│   │       │   │   │   ├── ChangePasswordCommand.cs
│   │       │   │   │   └── ImpersonateCustomerCommand.cs
│   │       │   │   ├── Queries/
│   │       │   │   │   ├── GetCustomerByIdQuery.cs
│   │       │   │   │   └── ListCustomersQuery.cs
│   │       │   │   └── Services/
│   │       │   │       ├── GoeSignInManager.cs          ← SmartSignInManager pattern
│   │       │   │       ├── CustomerActivityService.cs
│   │       │   │       ├── PermissionService.cs
│   │       │   │       ├── WorkContext.cs
│   │       │   │       ├── StoreContext.cs
│   │       │   │       ├── TokenService.cs
│   │       │   │       └── DeleteGuestsTask.cs          ← Smartstore background task
│   │       │   ├── GOE.Identity.Infrastructure/
│   │       │   │   ├── Repositories/
│   │       │   │   │   └── CustomerRepository.cs
│   │       │   │   └── Migrations/
│   │       │   │       └── CreateIdentitySchema_001.cs
│   │       │   └── GOE.Identity.Api/
│   │       │       ├── AuthController.cs
│   │       │       ├── CustomersController.cs
│   │       │       └── ExternalAuthController.cs
│   │       │
│   │       ├── 📦 Catalog/            ← nopCommerce catalog + Smartstore datasheets
│   │       │   ├── GOE.Catalog.Domain/
│   │       │   │   ├── Entities/
│   │       │   │   │   ├── Product.cs
│   │       │   │   │   ├── Category.cs
│   │       │   │   │   ├── ProductAttribute.cs
│   │       │   │   │   ├── ProductAttributeCombination.cs
│   │       │   │   │   ├── SpecificationAttribute.cs
│   │       │   │   │   ├── ProductTag.cs
│   │       │   │   │   ├── ProductReview.cs
│   │       │   │   │   ├── TierPrice.cs
│   │       │   │   │   └── Manufacturer.cs
│   │       │   │   └── Enums/
│   │       │   │       ├── ProductType.cs
│   │       │   │       └── BackorderMode.cs
│   │       │   ├── GOE.Catalog.Application/
│   │       │   ├── GOE.Catalog.Infrastructure/
│   │       │   └── GOE.Catalog.Api/
│   │       │
│   │       ├── 📦 Inventory/
│   │       │   ├── GOE.Inventory.Domain/
│   │       │   │   └── Entities/
│   │       │   │       ├── StockItem.cs
│   │       │   │       ├── Warehouse.cs
│   │       │   │       └── StockMovement.cs
│   │       │   ├── GOE.Inventory.Application/
│   │       │   ├── GOE.Inventory.Infrastructure/
│   │       │   └── GOE.Inventory.Api/
│   │       │
│   │       ├── 📦 Pricing/            ← Smartstore IPriceCalculationService pipeline
│   │       │   ├── GOE.Pricing.Domain/
│   │       │   │   ├── Entities/
│   │       │   │   │   ├── Discount.cs
│   │       │   │   │   ├── GiftCard.cs
│   │       │   │   │   └── GiftCardUsageHistory.cs
│   │       │   │   └── Services/
│   │       │   │       └── IPriceCalculationService.cs
│   │       │   ├── GOE.Pricing.Application/
│   │       │   │   └── Calculators/
│   │       │   │       ├── BasePriceCalculator.cs
│   │       │   │       ├── TierPriceCalculator.cs
│   │       │   │       ├── DiscountCalculator.cs
│   │       │   │       ├── TaxCalculator.cs
│   │       │   │       └── CurrencyCalculator.cs
│   │       │   ├── GOE.Pricing.Infrastructure/
│   │       │   └── GOE.Pricing.Api/
│   │       │
│   │       ├── 📦 Order/              ← nopCommerce order lifecycle
│   │       │   ├── GOE.Order.Domain/
│   │       │   │   ├── Entities/
│   │       │   │   │   ├── Order.cs
│   │       │   │   │   ├── OrderItem.cs
│   │       │   │   │   ├── Shipment.cs
│   │       │   │   │   ├── ShipmentItem.cs
│   │       │   │   │   └── ReturnRequest.cs
│   │       │   │   └── Enums/
│   │       │   │       ├── OrderStatus.cs
│   │       │   │       └── ReturnRequestStatus.cs
│   │       │   ├── GOE.Order.Application/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── PlaceOrderCommand.cs
│   │       │   │   │   ├── CancelOrderCommand.cs
│   │       │   │   │   ├── ReorderCommand.cs
│   │       │   │   │   └── SubmitReturnRequestCommand.cs
│   │       │   │   └── Services/
│   │       │   │       └── CheckoutService.cs
│   │       │   ├── GOE.Order.Infrastructure/
│   │       │   └── GOE.Order.Api/
│   │       │
│   │       ├── 📦 Payment/            ← nopCommerce 50+ gateway pattern
│   │       │   ├── GOE.Payment.Domain/
│   │       │   │   ├── Abstractions/
│   │       │   │   │   └── IPaymentMethod.cs
│   │       │   │   └── Entities/
│   │       │   │       ├── PaymentTransaction.cs
│   │       │   │       └── PaymentWebhookLog.cs
│   │       │   ├── GOE.Payment.Application/
│   │       │   ├── GOE.Payment.Infrastructure/
│   │       │   └── GOE.Payment.Api/
│   │       │
│   │       ├── 📦 Subscription/
│   │       │   ├── GOE.Subscription.Domain/
│   │       │   ├── GOE.Subscription.Application/
│   │       │   ├── GOE.Subscription.Infrastructure/
│   │       │   └── GOE.Subscription.Api/
│   │       │
│   │       ├── 📦 Digital/
│   │       │   ├── GOE.Digital.Domain/
│   │       │   │   └── Entities/
│   │       │   │       ├── Download.cs
│   │       │   │       └── LicenseKey.cs
│   │       │   ├── GOE.Digital.Application/
│   │       │   ├── GOE.Digital.Infrastructure/
│   │       │   └── GOE.Digital.Api/
│   │       │
│   │       ├── 📦 Shipping/           ← nopCommerce carrier adapters
│   │       │   ├── GOE.Shipping.Domain/
│   │       │   │   ├── Abstractions/
│   │       │   │   │   └── IShippingRateProvider.cs
│   │       │   │   └── Entities/
│   │       │   │       ├── Shipment.cs
│   │       │   │       └── ShippingMethod.cs
│   │       │   ├── GOE.Shipping.Application/
│   │       │   ├── GOE.Shipping.Infrastructure/
│   │       │   └── GOE.Shipping.Api/
│   │       │
│   │       ├── 📦 Vendor/             ← nopCommerce multi-vendor / dropshipping
│   │       │   ├── GOE.Vendor.Domain/
│   │       │   │   └── Entities/
│   │       │   │       ├── Vendor.cs
│   │       │   │       ├── VendorCommissionRule.cs
│   │       │   │       └── VendorPayoutRecord.cs
│   │       │   ├── GOE.Vendor.Application/
│   │       │   ├── GOE.Vendor.Infrastructure/
│   │       │   └── GOE.Vendor.Api/
│   │       │
│   │       ├── 📦 MultiStore/         ← nopCommerce multi-store + Smartstore IStoreContext
│   │       │   ├── GOE.MultiStore.Domain/
│   │       │   │   └── Entities/
│   │       │   │       ├── Store.cs
│   │       │   │       └── StoreSettingOverride.cs
│   │       │   ├── GOE.MultiStore.Application/
│   │       │   ├── GOE.MultiStore.Infrastructure/
│   │       │   └── GOE.MultiStore.Api/
│   │       │
│   │       ├── 📦 Search/             ← Elasticsearch full-text + facets
│   │       │   ├── GOE.Search.Domain/
│   │       │   ├── GOE.Search.Application/
│   │       │   │   └── Services/
│   │       │   │       ├── ISearchService.cs
│   │       │   │       └── ElasticsearchIndexer.cs
│   │       │   ├── GOE.Search.Infrastructure/
│   │       │   └── GOE.Search.Api/
│   │       │
│   │       ├── 📦 Notification/       ← SMTP + SMS + Push + Liquid templates
│   │       │   ├── GOE.Notification.Domain/
│   │       │   │   ├── Abstractions/
│   │       │   │   │   ├── IEmailSender.cs
│   │       │   │   │   └── ISmsSender.cs
│   │       │   │   └── Entities/
│   │       │   │       ├── MessageTemplate.cs
│   │       │   │       └── QueuedEmail.cs
│   │       │   ├── GOE.Notification.Application/
│   │       │   │   └── Services/
│   │       │   │       ├── LiquidTemplateEngine.cs    ← Smartstore Fluid engine
│   │       │   │       └── SendQueuedEmailsTask.cs
│   │       │   ├── GOE.Notification.Infrastructure/
│   │       │   └── GOE.Notification.Api/
│   │       │
│   │       ├── 📦 CMS/                ← nopCommerce Blog / News / Forums / Pages
│   │       │   ├── GOE.Cms.Domain/
│   │       │   │   └── Entities/
│   │       │   │       ├── Page.cs
│   │       │   │       ├── BlogPost.cs
│   │       │   │       ├── NewsItem.cs
│   │       │   │       └── Forum.cs
│   │       │   ├── GOE.Cms.Application/
│   │       │   ├── GOE.Cms.Infrastructure/
│   │       │   └── GOE.Cms.Api/
│   │       │
│   │       ├── 📦 Marketing/          ← SEO + Campaigns + Affiliate + Social Auth
│   │       │   ├── GOE.Marketing.Domain/
│   │       │   │   └── Entities/
│   │       │   │       ├── Campaign.cs
│   │       │   │       ├── AffiliateRecord.cs
│   │       │   │       └── UrlRecord.cs           ← SEO slugs + 301 redirects
│   │       │   ├── GOE.Marketing.Application/
│   │       │   ├── GOE.Marketing.Infrastructure/
│   │       │   └── GOE.Marketing.Api/
│   │       │
│   │       ├── 📦 RulesEngine/        ← Smartstore IRuleProvider
│   │       │   ├── GOE.RulesEngine.Domain/
│   │       │   │   ├── Abstractions/
│   │       │   │   │   └── IRuleProvider.cs
│   │       │   │   └── Entities/
│   │       │   │       └── RuleSet.cs
│   │       │   ├── GOE.RulesEngine.Application/
│   │       │   ├── GOE.RulesEngine.Infrastructure/
│   │       │   └── GOE.RulesEngine.Api/
│   │       │
│   │       ├── 📦 ThemeEngine/        ← Smartstore theme inheritance
│   │       │   ├── GOE.ThemeEngine.Domain/
│   │       │   │   └── Entities/
│   │       │   │       └── ThemeManifest.cs
│   │       │   ├── GOE.ThemeEngine.Application/
│   │       │   │   └── Services/
│   │       │   │       ├── IHtmlToPdfConverter.cs  ← Smartstore HTML-to-PDF
│   │       │   │       └── ThemeRegistry.cs
│   │       │   ├── GOE.ThemeEngine.Infrastructure/
│   │       │   └── GOE.ThemeEngine.Api/
│   │       │
│   │       ├── 📦 Plugin/             ← nopCommerce plugin lifecycle
│   │       │   ├── GOE.Plugin.Domain/
│   │       │   │   ├── Abstractions/
│   │       │   │   │   └── IPlugin.cs
│   │       │   │   └── Entities/
│   │       │   │       └── PluginDescriptor.cs
│   │       │   ├── GOE.Plugin.Application/
│   │       │   │   └── Services/
│   │       │   │       └── PluginManager.cs
│   │       │   ├── GOE.Plugin.Infrastructure/
│   │       │   └── GOE.Plugin.Api/
│   │       │
│   │       ├── 📦 Scheduling/         ← Quartz.NET task runner
│   │       │   ├── GOE.Scheduling.Domain/
│   │       │   │   └── Abstractions/
│   │       │   │       └── IScheduledTask.cs
│   │       │   ├── GOE.Scheduling.Application/
│   │       │   ├── GOE.Scheduling.Infrastructure/
│   │       │   └── GOE.Scheduling.Api/
│   │       │
│   │       ├── 📦 Reporting/          ← Analytics + Export
│   │       │   ├── GOE.Reporting.Domain/
│   │       │   ├── GOE.Reporting.Application/
│   │       │   ├── GOE.Reporting.Infrastructure/
│   │       │   └── GOE.Reporting.Api/
│   │       │
│   │       └── 📦 Installation/       ← First-time Installation Wizard
│   │           ├── GOE.Installation.Domain/
│   │           │   ├── Abstractions/
│   │           │   │   └── IInstallationService.cs
│   │           │   └── Models/
│   │           │       ├── DatabaseConfig.cs
│   │           │       ├── StoreSetup.cs
│   │           │       └── AdminUserSetup.cs
│   │           ├── GOE.Installation.Application/
│   │           │   └── Services/
│   │           │       └── InstallationService.cs
│   │           ├── GOE.Installation.Infrastructure/
│   │           └── GOE.Installation.Api/
│   │               └── InstallController.cs
│   │
│   └── tests/
│       ├── GOE.Identity.Tests/
│       ├── GOE.Catalog.Tests/
│       ├── GOE.Order.Tests/
│       ├── GOE.Pricing.Tests/
│       ├── GOE.Payment.Tests/
│       └── GOE.Integration.Tests/
│
├── 📂 frontend/                       ← Vue 3 + Vite SPA
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       │
│       ├── modules/
│       │   ├── catalog/
│       │   │   ├── views/
│       │   │   │   ├── ProductListView.vue
│       │   │   │   └── ProductDetailView.vue
│       │   │   └── components/
│       │   │       ├── ProductCard.vue
│       │   │       ├── FacetFilter.vue
│       │   │       └── ProductDatasheet.vue
│       │   ├── cart/
│       │   │   ├── views/CartView.vue
│       │   │   └── components/
│       │   │       ├── CartItem.vue
│       │   │       ├── CouponInput.vue
│       │   │       ├── GiftCardInput.vue
│       │   │       └── RewardPointsToggle.vue
│       │   ├── checkout/
│       │   │   ├── views/
│       │   │   │   ├── CheckoutView.vue
│       │   │   │   └── GuestCheckoutView.vue     ← nopCommerce guest pattern
│       │   │   └── steps/
│       │   │       ├── AddressStep.vue
│       │   │       ├── ShippingStep.vue
│       │   │       └── PaymentStep.vue
│       │   ├── account/
│       │   │   ├── views/AccountDashboardView.vue
│       │   │   └── tabs/
│       │   │       ├── OrderHistoryTab.vue
│       │   │       ├── DownloadsTab.vue
│       │   │       ├── RewardPointsTab.vue       ← nopCommerce
│       │   │       ├── GiftCardsTab.vue           ← nopCommerce
│       │   │       └── ReviewsTab.vue             ← nopCommerce My Account tab
│       │   ├── vendor/
│       │   │   └── views/VendorStorefrontView.vue
│       │   ├── cms/
│       │   │   ├── views/
│       │   │   │   ├── BlogView.vue
│       │   │   │   ├── NewsView.vue
│       │   │   │   └── ForumView.vue
│       │   │   └── components/
│       │   └── admin/
│       │       ├── views/
│       │       │   ├── DashboardView.vue
│       │       │   ├── CatalogView.vue
│       │       │   ├── OrdersView.vue
│       │       │   ├── CustomersView.vue
│       │       │   ├── VendorsView.vue
│       │       │   ├── ReportsView.vue
│       │       │   ├── PluginsView.vue            ← nopCommerce plugin lifecycle
│       │       │   ├── ThemesView.vue             ← Smartstore theme inheritance
│       │       │   ├── StoresView.vue             ← nopCommerce multi-store
│       │       │   ├── RulesView.vue              ← Smartstore rules engine
│       │       │   └── SystemView.vue
│       │       └── components/
│       │
│       ├── stores/                    ← Pinia stores
│       │   ├── auth.store.ts
│       │   ├── cart.store.ts
│       │   ├── catalog.store.ts
│       │   ├── workContext.store.ts   ← IWorkContext (Smartstore)
│       │   └── multiStore.store.ts    ← IStoreContext (Smartstore)
│       │
│       ├── api/                       ← Axios clients
│       │   ├── http.ts                ← Interceptors + JWT attach + refresh
│       │   ├── auth.api.ts
│       │   ├── catalog.api.ts
│       │   ├── order.api.ts
│       │   ├── cart.api.ts
│       │   └── vendor.api.ts
│       │
│       ├── composables/
│       │   ├── useWorkContext.ts      ← Smartstore IWorkContext on frontend
│       │   ├── usePermissions.ts      ← ACL checks (nopCommerce + Smartstore)
│       │   ├── useCart.ts
│       │   ├── useCheckout.ts
│       │   └── useMultiStore.ts
│       │
│       ├── router/
│       │   └── index.ts               ← Full route map (see Route Map below)
│       │
│       ├── i18n/
│       │   ├── index.ts
│       │   └── locales/
│       │       ├── en-US.json
│       │       ├── de-DE.json
│       │       └── ...                ← 300+ language packs
│       │
│       ├── layouts/
│       │   ├── DefaultLayout.vue
│       │   ├── AdminLayout.vue
│       │   ├── VendorLayout.vue
│       │   └── AuthLayout.vue
│       │
│       └── themes/                    ← Smartstore theme override pattern
│           └── goe-storefront/
│               ├── theme.json
│               └── _variables.scss
│
├── 📂 mobile/                         ← .NET MAUI App
│   ├── GOE.Mobile.sln
│   └── src/
│       └── GOE.Mobile/
│           ├── MauiProgram.cs
│           ├── App.xaml
│           ├── AppShell.xaml
│           ├── AppConstants.cs
│           ├── Pages/
│           │   ├── LoginPage.xaml           ← Admin + Manager only
│           │   ├── DashboardPage.xaml       ← KPIs: revenue, orders, low-stock
│           │   ├── ProductsPage.xaml
│           │   ├── ProductDetailPage.xaml
│           │   ├── OrdersPage.xaml
│           │   ├── OrderDetailPage.xaml
│           │   ├── CreateOrderPage.xaml
│           │   ├── ReturnRequestsPage.xaml  ← nopCommerce RMA
│           │   ├── InventoryPage.xaml
│           │   └── VendorsPage.xaml         ← nopCommerce marketplace
│           ├── ViewModels/
│           │   ├── LoginViewModel.cs
│           │   ├── DashboardViewModel.cs
│           │   ├── ProductsViewModel.cs
│           │   ├── OrdersViewModel.cs
│           │   ├── InventoryViewModel.cs
│           │   └── VendorsViewModel.cs
│           ├── Services/
│           │   ├── IApiService.cs
│           │   ├── ApiService.cs             ← HttpClient → GOE backend REST API
│           │   ├── AuthService.cs            ← JWT + SecureStorage
│           │   └── WorkContextService.cs     ← Mobile IWorkContext equivalent
│           └── Models/
│               ├── CustomerDto.cs
│               ├── ProductDto.cs
│               ├── OrderDto.cs
│               └── StoreDto.cs
│
├── 📂 plugins/                        ← First-party GOE plugin bundles
│   ├── Payments.Stripe/
│   │   ├── plugin.json
│   │   ├── StripePaymentMethod.cs     ← IPaymentMethod implementation
│   │   └── StripeSettings.cs
│   ├── Payments.PayPal/
│   ├── Payments.Razorpay/
│   ├── Shipping.FedEx/
│   ├── Shipping.UPS/                  ← OAuth API (nopCommerce 4.70 pattern)
│   ├── Shipping.DHL/
│   ├── Tax.Avalara/
│   ├── Search.Elasticsearch/
│   ├── Marketing.Omnisend/
│   ├── Auth.Google/                   ← IExternalAuthenticationMethod (Smartstore)
│   ├── Auth.Facebook/                 ← IExternalAuthenticationMethod (Smartstore)
│   ├── Captcha.FriendlyCaptcha/       ← GDPR-compliant CAPTCHA (Smartstore)
│   ├── Pdf.Invoice/                   ← HTML-to-PDF invoices (Smartstore)
│   ├── Export.GoogleMerchant/         ← Google Merchant Center feed (Smartstore)
│   ├── Cms.Blog/                      ← Blog plugin (nopCommerce)
│   └── Cms.Forums/                    ← Forums plugin (nopCommerce)
│
├── 📂 themes/                         ← Smartstore theme inheritance model
│   └── GOE-Storefront/
│       ├── theme.json                 ← { "BaseTheme": "Flex" }
│       ├── _variables.scss            ← Bootstrap token overrides
│       ├── Views/                     ← Only overridden Razor partial views
│       └── wwwroot/                   ← Additional static assets
│
├── 📂 docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.api
│   └── Dockerfile.frontend
│
├── 📂 scripts/
│   ├── seed/
│   │   ├── SeedRoles.cs
│   │   ├── SeedCurrencies.cs
│   │   ├── SeedCountries.cs
│   │   ├── SeedLanguages.cs
│   │   └── SeedMessageTemplates.cs
│   └── migrations/
│       └── README.md
│
├── 📂 docs/
│   ├── architecture/
│   │   ├── GOE-Architecture-v3.docx
│   │   ├── ddd-module-map.md
│   │   └── adr/                       ← Architecture Decision Records
│   │       ├── ADR-001-ddd-modular.md
│   │       ├── ADR-002-multidb.md
│   │       └── ADR-003-plugin-system.md
│   └── api/
│       └── openapi.yaml
│
└── README.md                          ← You are here
```

---

## 📦 Module Bundle Map

> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) · [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html)

| Bundle | Key Responsibilities | Primary Source |
|---|---|---|
| `Identity` | Customer, CustomerRole, ExternalAuthRecord, IWorkContext, GoeSignInManager, ACL, DeleteGuestsTask | Smartstore + nopCommerce |
| `Catalog` | Products, Categories, Variants, Bundles, Tags, Datasheets, Spec Attributes, Reviews | Smartstore + nopCommerce |
| `Inventory` | Stock per warehouse, Backorders, Low-stock alerts, Attribute-level stock | nopCommerce |
| `Pricing` | Tier pricing, Discounts, Gift cards, Tax, EU VAT, Price pipeline | nopCommerce + Smartstore |
| `Order` | Order lifecycle, Guest checkout, Shipments, Returns, Re-order, PDF invoice | nopCommerce + Smartstore |
| `Payment` | IPaymentMethod adapters, Webhooks, Transactions (50+ gateways) | nopCommerce |
| `Subscription` | Plans, Billing cycles, Trials, Churn, Proration | GOE original |
| `Digital` | Download links, License keys, Expiry management | Smartstore + nopCommerce |
| `Shipping` | Carrier adapters, Table rates, Dropshipping, Pickup points | nopCommerce + Smartstore |
| `Vendor` | Vendor profiles, Commission, Payouts, Marketplace ACL | nopCommerce |
| `MultiStore` | Unlimited storefronts, IStoreContext, Per-store settings | nopCommerce + Smartstore |
| `Notification` | SMTP, SMS, Push, In-App, Liquid template engine | Smartstore |
| `Search` | Elasticsearch full-text + faceted navigation | Smartstore + GOE |
| `CMS` | Pages, Blog, News, Forums, Message templates | nopCommerce |
| `Marketing` | SEO, Campaigns, Reward points, Affiliate, Social auth | nopCommerce + Smartstore |
| `RulesEngine` | Conditional rule sets for pricing / shipping / access | Smartstore |
| `ThemeEngine` | Theme inheritance, HTML-to-PDF, Liquid, Sass pipeline | Smartstore |
| `Plugin` | Plugin lifecycle, Registry, Sandboxing (install/uninstall) | nopCommerce + Smartstore |
| `Scheduling` | Quartz.NET cron tasks, Task history, Admin task list | Smartstore |
| `Reporting` | Analytics, Sales dashboards, Export manager | nopCommerce |
| `Installation` | First-run wizard, DB setup, Seed data, Admin creation | nopCommerce + Smartstore |

---

## 🗄 Database Support

> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) — nopCommerce supports SQL Server (primary), MySQL, and PostgreSQL via EF Core providers.

```jsonc
// appsettings.json
{
  "DatabaseProvider": "SqlServer",   // "SqlServer" | "PostgreSQL" | "MySQL"
  "ConnectionStrings": {
    "SqlServer":  "Server=.;Database=GOE;Trusted_Connection=True;",
    "PostgreSQL": "Host=localhost;Port=5432;Database=goe;Username=goe;Password=secret;",
    "MySQL":      "Server=localhost;Port=3306;Database=goe;Uid=goe;Pwd=secret;"
  }
}
```

```csharp
// Program.cs — provider switching
var provider = builder.Configuration["DatabaseProvider"];
var connStr  = builder.Configuration.GetConnectionString(provider!);

builder.Services.AddDbContext<GoeDbContext>(opts => _ = provider switch
{
    "SqlServer"  => opts.UseSqlServer(connStr),
    "PostgreSQL" => opts.UseNpgsql(connStr),
    "MySQL"      => opts.UseMySql(connStr, ServerVersion.AutoDetect(connStr)),
    _            => throw new InvalidOperationException($"Unknown provider: {provider}")
});
```

---

## 🔑 Key Design Patterns

### IWorkContext & IStoreContext _(Smartstore)_
> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity)

```csharp
public interface IWorkContext
{
    Customer       CurrentCustomer  { get; set; }
    Language       WorkingLanguage  { get; set; }
    Currency       WorkingCurrency  { get; set; }
    bool           IsAdmin          { get; }
    TaxDisplayType TaxDisplayType   { get; }
}

public interface IStoreContext
{
    Store CurrentStore   { get; set; }
    int   CurrentStoreId => CurrentStore.Id;
}
```

---

### GoeSignInManager _(Smartstore)_
> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) — mirrors `SmartSignInManager` — login by email or username, lockout, JWT issuance.

```csharp
public class GoeSignInManager : SignInManager<Customer>
{
    public async Task<AuthResult> SignInByEmailOrUsernameAsync(
        string credential, string password, bool rememberMe)
    {
        var user = credential.Contains('@')
            ? await UserManager.FindByEmailAsync(credential)
            : await UserManager.FindByNameAsync(credential);

        if (user == null) return AuthResult.NotFound;

        var result = await PasswordSignInAsync(
            user, password, rememberMe, lockoutOnFailure: true);

        if (result.Succeeded)
        {
            _work.CurrentCustomer = user;
            await _events.PublishAsync(new CustomerLoggedInEvent(user.Id));
            return AuthResult.Success(_tokens.GenerateJwt(user),
                                      _tokens.GenerateRefreshToken(user));
        }
        if (result.IsLockedOut) return AuthResult.LockedOut;
        return AuthResult.InvalidCredentials;
    }
}
```

---

### IExternalAuthenticationMethod _(Smartstore)_
> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) — OAuth providers register as module plugins.

```csharp
public interface IExternalAuthenticationMethod
{
    string SystemName    { get; }   // e.g. "ExternalAuth.Google"
    string FriendlyName  { get; }
    void   Configure(AuthenticationBuilder builder);
    Task<ExternalAuthResult> AuthenticateAsync(HttpContext ctx);
}
```

Shipped providers: **Google**, **Facebook**, **Apple** (see `/plugins/Auth.*`)

---

### IPermissionService & ACL _(nopCommerce + Smartstore)_
> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) — ACL configured per product, category, plugin, and store.

```csharp
public interface IPermissionService
{
    Task<bool> AuthorizeAsync(string permissionKey);
    Task       DemandAsync(string permissionKey);   // throws 403 if denied
}

public static class Permissions
{
    public const string CatalogRead         = "catalog.read";
    public const string CatalogWrite        = "catalog.write";
    public const string OrderRead           = "order.read";
    public const string OrderWrite          = "order.write";
    public const string CustomerRead        = "customer.read";
    public const string CustomerWrite       = "customer.write";
    public const string ManageCustomerRoles = "customer.roles.manage";
    public const string ManagePlugins       = "plugin.manage";
    public const string ManageVendors       = "vendor.manage";
    public const string ManageStores        = "store.manage";
    public const string ViewReports         = "report.view";
    public const string SystemSettings      = "system.settings";
}
```

---

### Rules Engine _(Smartstore)_
> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) — IRuleProvider drives conditional pricing, shipping, and access without code changes.

```csharp
public interface IRuleProvider
{
    Task<bool> EvaluateAsync(RuleSet ruleSet, RuleContext ctx);
}

// Example rule: Free shipping for Gold members with cart > $100
RuleSet {
    Operator: AND,
    Rules: [
        { Field: "Customer.Role",  Op: "In", Value: ["Gold"] },
        { Field: "Cart.SubTotal",  Op: ">=", Value: 100      }
    ],
    Action: ApplyFreeShipping
}
```

---

### Liquid Templates & HTML-to-PDF _(Smartstore)_
> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) — Fluid (Liquid-compatible) for emails, CMS, and PDF; HTML-to-PDF from regular HTML templates.

```csharp
public interface IHtmlToPdfConverter
{
    Task<byte[]> ConvertAsync(string html, PdfOptions options);
}

// Generate order invoice — attached to order emails (nopCommerce setting)
var html = await _templateEngine.RenderAsync("invoice", orderModel);
var pdf  = await _pdfConverter.ConvertAsync(html, new PdfOptions { PageSize = PageSize.A4 });
```

---

### Plugin Lifecycle _(nopCommerce + Smartstore)_
> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) — Configuration → Local plugins; install/uninstall/enable/disable; Limited to customer roles; Limited to stores.

```csharp
public interface IPlugin
{
    PluginDescriptor Descriptor  { get; }
    Task InstallAsync();    // creates DB tables, seeds defaults
    Task UninstallAsync();  // removes own tables and settings
    Task UpdateAsync(string fromVersion, string toVersion);
}
```

---

### Multi-Store & Multi-Vendor _(nopCommerce)_
> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) — Unlimited storefronts, shared DB, single admin panel, customers log in across all stores, different themes per store.

```csharp
public class StoreContext : IStoreContext
{
    public Store CurrentStore
    {
        get
        {
            var host  = _http.HttpContext!.Request.Host.Host;
            return _repo.GetByHost(host) ?? _repo.GetPrimary();
        }
    }
}
```

---

### Tier Pricing & Discounts _(nopCommerce)_
> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) — Volume-based tier pricing per customer role and store; discount engine with coupon codes, stacking rules, date ranges.

```csharp
public class TierPrice
{
    public int       ProductId      { get; set; }
    public int?      CustomerRoleId { get; set; }   // null = all roles
    public int?      StoreId        { get; set; }   // null = all stores
    public int       Quantity       { get; set; }   // min qty to qualify
    public decimal   Price          { get; set; }
    public DateTime? StartDateUtc   { get; set; }
    public DateTime? EndDateUtc     { get; set; }
}
```

---

### Reward Points & Gift Cards _(nopCommerce)_
> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html)

```csharp
public class RewardPointsHistory
{
    public int     CustomerId   { get; set; }
    public int     Points       { get; set; }   // positive = earned, negative = spent
    public string  Message      { get; set; }   // "Order #1234 purchase"
    public decimal UsedAmount   { get; set; }
    public int?    OrderId      { get; set; }
    public DateTime CreatedOnUtc{ get; set; }
}
// Config: 1 point per $1 spent · 100 pts = $1 credit · min 100 pts to redeem
```

---

### Guest Checkout _(nopCommerce)_
> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) — Anonymous checkout without account creation; transient guest Customer cleaned by DeleteGuestsTask.

```csharp
if (req.IsGuest)
{
    customer = Customer.CreateGuest(req.Email);
    await _customerRepo.AddAsync(customer);
}
```

---

### DeleteGuestsTask _(Smartstore)_
> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) — Background task that prunes stale guest Customer records.

```csharp
public class DeleteGuestsTask : IScheduledTask
{
    public string CronExpression => "0 3 * * *";   // daily at 3 AM

    public async Task RunAsync(TaskExecutionContext ctx)
    {
        var cutoff = DateTime.UtcNow.AddDays(-7);
        var guests  = await _customerRepo.GetStaleGuestsAsync(cutoff);
        await _customerRepo.DeleteRangeAsync(guests);
        ctx.Log.Info($"Deleted {guests.Count} stale guest accounts.");
    }
}
```

---

## 🧙 Installation Service

> **Ref:** [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html) · [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity)

GOE ships a built-in **8-step Installation Wizard** that runs on first launch when no `install.lock` is present.

| Step | Screen | Actions |
|---|---|---|
| 1 | Welcome & Prerequisites | Check .NET runtime, DB connectivity, env vars |
| 2 | Database Configuration | Choose SQL Server / PostgreSQL / MySQL; test connection |
| 3 | Schema Migration | Run FluentMigrator migrations with progress bar |
| 4 | Seed Data | Roles, 150+ currencies, countries, languages, email templates |
| 5 | Store Settings | Store name, logo, URL, currency, language, timezone |
| 6 | Admin Account | Create SuperAdmin — name, email, password (complexity enforced) |
| 7 | Plugins | Optional: configure Stripe/PayPal keys, enable plugins |
| 8 | Complete | Write `install.lock`; rebuild Elasticsearch index |

```csharp
public interface IInstallationService
{
    Task<bool>          IsInstalledAsync();
    Task<InstallResult> TestConnectionAsync(DatabaseConfig cfg);
    Task<InstallResult> RunMigrationsAsync(DatabaseConfig cfg);
    Task<InstallResult> SeedDataAsync();
    Task<InstallResult> SaveStoreSettingsAsync(StoreSetup setup);
    Task<InstallResult> CreateAdminUserAsync(AdminUserSetup setup);
    Task<InstallResult> EnablePluginsAsync(IList<string> systemNames);
    Task               CompleteInstallationAsync();
}
```

**Installer endpoints:** `GET /install/status` · `POST /install/test-connection` · `POST /install/migrate` · `POST /install/seed` · `POST /install/store-settings` · `POST /install/admin-user` · `POST /install/plugins` · `POST /install/complete`

---

## ⚙ Configuration Reference

```jsonc
// backend/src/GOE.Api/appsettings.json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "SqlServer":   "Server=.;Database=GOE;Trusted_Connection=True;",
    "PostgreSQL":  "Host=localhost;Port=5432;Database=goe;Username=goe;Password=secret;",
    "MySQL":       "Server=localhost;Port=3306;Database=goe;Uid=goe;Pwd=secret;"
  },
  "Jwt": {
    "Secret":          "CHANGE_ME_MIN_256_BIT_KEY",
    "Issuer":          "goe-api",
    "Audience":        "goe-clients",
    "AccessTokenTTL":  "15m",
    "RefreshTokenTTL": "7d"
  },
  "Store": {
    "Name":            "My GOE Store",
    "DefaultCurrency": "USD",
    "DefaultLocale":   "en-US",
    "Timezone":        "UTC"
  },
  "Email": {
    "Provider": "SMTP",
    "Smtp": { "Host": "smtp.mailgun.org", "Port": 587,
              "Username": "noreply@goe.store", "Password": "secret" }
  },
  "Payment": {
    "Stripe":  { "SecretKey": "sk_live_...", "WebhookSecret": "whsec_..." },
    "PayPal":  { "ClientId": "...", "Secret": "..." }
  },
  "Elasticsearch": { "Url": "http://localhost:9200" },
  "Redis":         { "ConnectionString": "localhost:6379" },
  "RabbitMq":      { "Host": "localhost", "Username": "guest", "Password": "guest" }
}
```

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME="GOE Store"
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=...
```

```csharp
// mobile/src/GOE.Mobile/AppConstants.cs
public static class AppConstants
{
    public const string ApiBaseUrl = "https://api.goe.store/";
    public const string AppName    = "GOE Mobile";
}
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| .NET SDK | 10.0+ | `dotnet --version` |
| Node.js | 22 LTS | `node --version` |
| SQL Server / PostgreSQL / MySQL | Latest | Per preference |
| Elasticsearch | 8.x | For search features |
| Redis | Latest | Distributed cache |
| Docker (optional) | Latest | `docker --version` |

---

### Backend Setup

```bash
# 1. Clone
git clone https://github.com/your-org/AMNNSPK.git
cd AMNNSPK/backend

# 2. Restore packages
dotnet restore

# 3. Configure database + JWT
#    Edit: src/GOE.Api/appsettings.json

# 4. Run
dotnet run --project src/GOE.Api

# 5. Open Installation Wizard
open http://localhost:5000/install
```

---

### Frontend Setup

```bash
cd ../frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000

# 3. Start dev server
npm run dev

# 4. Open storefront
open http://localhost:5173
```

---

### Mobile Setup

```bash
cd ../mobile

# Update AppConstants.cs with your backend API URL

# Android
dotnet run -f net10.0-android

# iOS (requires macOS + Xcode)
dotnet run -f net10.0-ios

# Windows
dotnet run -f net10.0-windows10.0.19041.0
```

---

### Docker Compose (All Services)

```yaml
# docker/docker-compose.yml

services:

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB:       goe
      POSTGRES_USER:     goe
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  elasticsearch:
    image: elasticsearch:8.14.0
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
    ports: ["9200:9200"]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]

  api:
    build:
      context: ../backend
      dockerfile: ../docker/Dockerfile.api
    environment:
      DatabaseProvider: PostgreSQL
      ConnectionStrings__PostgreSQL: "Host=db;Database=goe;Username=goe;Password=secret;"
      Jwt__Secret: "CHANGE_ME_256_BIT_SECRET"
    ports: ["5000:8080"]
    depends_on: [db, redis, elasticsearch, rabbitmq]

  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
    environment:
      VITE_API_BASE_URL: http://api:8080
    ports: ["5173:80"]
    depends_on: [api]
```

```bash
cd docker
docker-compose up -d
open http://localhost:5173/install
```

---

## ✅ Feature Parity Matrix

> **Ref:** [dev.smartstore.com/framework/platform/identity](https://dev.smartstore.com/framework/platform/identity) · [docs.nopcommerce.com/en/index.html](https://docs.nopcommerce.com/en/index.html)

| Feature | Source Platform | Status |
|---|---|---|
| DDD Modular Architecture | Smartstore | ✅ Implemented |
| IWorkContext / IStoreContext | Smartstore | ✅ Implemented |
| SmartSignInManager (email/username login) | Smartstore | ✅ Implemented |
| IExternalAuthenticationMethod (OAuth) | Smartstore | ✅ Implemented |
| ExternalAuthenticationRecord entity | Smartstore | ✅ Implemented |
| DeleteGuestsTask background cleanup | Smartstore | ✅ Implemented |
| Rules Engine (IRuleProvider) | Smartstore | ✅ Implemented |
| Liquid Template Engine | Smartstore | ✅ Implemented |
| HTML-to-PDF Generator | Smartstore | ✅ Implemented |
| Theme Inheritance Engine | Smartstore | ✅ Implemented |
| WebhookEndpointAttribute | Smartstore | ✅ Implemented |
| Multi-Store Architecture | nopCommerce | ✅ Implemented |
| Multi-Vendor / Dropshipping | nopCommerce | ✅ Implemented |
| Tier Pricing (per role, per store) | nopCommerce | ✅ Implemented |
| Discount Engine (50+ gateway adapters) | nopCommerce | ✅ Implemented |
| Reward Points Program | nopCommerce | ✅ Implemented |
| Gift Cards (virtual + physical) | nopCommerce | ✅ Implemented |
| ACL per Product / Category / Plugin | nopCommerce | ✅ Implemented |
| "Limited to Stores" per entity | nopCommerce | ✅ Implemented |
| Guest / Anonymous Checkout | nopCommerce | ✅ Implemented |
| Re-Order from account page | nopCommerce | ✅ Implemented |
| Return Requests & RMA Workflow | nopCommerce | ✅ Implemented |
| Admin Customer Impersonation | nopCommerce | ✅ Implemented |
| Customer Activity Log | nopCommerce | ✅ Implemented |
| GDPR Consent & Data Export | nopCommerce | ✅ Implemented |
| Product Reviews with Approval | nopCommerce | ✅ Implemented |
| Blog, News, Forums, Pages (CMS) | nopCommerce | ✅ Implemented |
| Plugin Install/Uninstall/Enable/Disable | nopCommerce + Smartstore | ✅ Implemented |
| EU VAT + Tax Providers | nopCommerce | ✅ Implemented |
| UPS OAuth API (updated pattern) | nopCommerce 4.70 | ✅ Implemented |
| First-Time Installation Wizard | nopCommerce + Smartstore | ✅ Implemented |
| Vue 3 SPA Storefront | GOE Original | ✅ Unique |
| .NET MAUI Mobile App | GOE Original | ✅ Unique |

---

## 🗺 API Endpoints Overview

```
POST   /install/test-connection
POST   /install/migrate
POST   /install/complete

POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/external/{provider}
POST   /customers/{id}/impersonate

GET    /catalog/products
GET    /catalog/products/{slug}
GET    /catalog/categories
GET    /search?q={query}

GET    /cart
POST   /cart/items
DELETE /cart/items/{id}
POST   /cart/coupons
POST   /cart/gift-cards

POST   /checkout
POST   /checkout/guest

GET    /orders
GET    /orders/{id}
POST   /orders/{id}/reorder
POST   /orders/{id}/return-request

GET    /account/reward-points
GET    /account/downloads
GET    /account/gift-cards

GET    /admin/customers
GET    /admin/vendors
GET    /admin/reports/sales
POST   /admin/plugins/{name}/install
POST   /admin/plugins/{name}/uninstall
GET    /admin/stores
POST   /admin/rules

GET    /webhooks/stripe
GET    /webhooks/paypal
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Follow the DDD 4-layer pattern for new bundles
4. Add xUnit tests in the corresponding `*.Tests` project
5. Submit a pull request

**Architecture references to follow:**
- [Smartstore Framework Docs](https://dev.smartstore.com/framework/platform/identity)
- [nopCommerce Developer Docs](https://docs.nopcommerce.com/en/index.html)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**GOE — Global Order Engine**  
Built with ❤️ on .NET 10 · Vue 3 · .NET MAUI  

Architecture inspired by  
[Smartstore](https://dev.smartstore.com/framework/platform/identity) · [nopCommerce](https://docs.nopcommerce.com/en/index.html)

</div>

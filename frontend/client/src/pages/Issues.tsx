import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GithubIssue } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { GitBranch, ExternalLink, CheckSquare, Square, Tag } from "lucide-react";

const LABEL_STYLES: Record<string, string> = {
  "testing": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  "integration-test": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "identity": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  "orders": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "pricing": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

// Full test checklist items per issue (from our generated issues)
const ISSUE_DETAILS: Record<number, { section: string; items: string[] }[]> = {
  1: [
    { section: "POST /api/auth/register", items: [
      "Happy path — valid payload returns 200 + customerId",
      "Duplicate email returns 400",
      "Weak password rejected by ASP.NET Identity returns 400",
      "Missing email field returns 400 (model binding)",
      "Invalid email format returns 400",
      "CustomerRegisteredEvent is published after successful registration",
      "Newly registered customer is assigned 'Registered' role",
    ]},
    { section: "POST /api/auth/login", items: [
      "Happy path — correct credentials return 200 + accessToken",
      "JWT payload contains correct customerId (sub) and role claim",
      "Wrong password returns 401 with 'Invalid credentials.' message",
      "Non-existent email returns 401",
      "Inactive customer returns 401",
      "Locked-out customer returns 401 with 'Account locked.' message",
      "Successful login updates LastLoginDateUtc and LastIpAddress in DB",
      "CustomerLoggedInEvent is published on successful login",
      "5 consecutive wrong passwords trigger lockout",
      "Login succeeds after lockout period expires",
    ]},
  ],
  2: [
    { section: "PasswordSignInAsync", items: [
      "Returns SignInResult.Success for valid email + password",
      "Returns SignInResult.Failed for unknown email",
      "Returns SignInResult.Failed for inactive customer (Active = false)",
      "Returns SignInResult.Failed for wrong password and increments FailedLoginAttempts",
      "Returns SignInResult.LockedOut when LockoutEndDateUtc is in the future",
      "Sets LockoutEndDateUtc after 5th failed attempt",
      "Clears FailedLoginAttempts and LockoutEndDateUtc on successful sign-in",
      "Updates LastLoginDateUtc and LastIpAddress on success",
      "Publishes CustomerLoggedInEvent with correct fields on success",
      "Does NOT publish event on failed sign-in",
    ]},
    { section: "ExternalLoginAsync", items: [
      "Creates new customer when email is not in repository",
      "Returns existing customer and adds ExternalAuthRecord when email matches but provider not linked",
      "Does NOT add duplicate ExternalAuthRecord when already linked",
      "Publishes CustomerRegisteredEvent only for genuinely new customers",
    ]},
  ],
  3: [
    { section: "Core Checkout Flow", items: [
      "Happy path — authenticated customer with one item creates order and returns orderId",
      "Happy path — guest checkout (IsGuest = true) succeeds",
      "Multi-item cart — all lines are priced and persisted correctly",
      "Server-side price recalculation overrides client-submitted price",
      "Empty cart returns failure result (no order created)",
      "CouponCode is forwarded to PriceCalculationService",
      "CurrencyCode is forwarded to PriceCalculationService and stored on Order",
    ]},
    { section: "Order Status Defaults", items: [
      "Order created with ShippingMethod has ShippingStatus = NotYetShipped",
      "Order created without ShippingMethod has ShippingStatus = ShippingNotRequired",
      "Newly placed order always has OrderStatus = Pending and PaymentStatus = Pending",
    ]},
    { section: "Financial Calculations", items: [
      "OrderSubtotalInclTax equals sum of all OrderItem.PriceInclTax",
      "OrderItem.UnitPriceExclTax = UnitPriceInclTax / 1.10 (10% reverse tax)",
      "OrderTax = sum of (PriceInclTax - PriceExclTax) across all items",
    ]},
    { section: "Error Handling", items: [
      "PriceCalculationService exception propagates and no order is persisted",
      "DB SaveChanges failure rolls back — no partial order persisted",
    ]},
  ],
  4: [
    { section: "Calculator Ordering", items: [
      "Calculators execute in ascending Order property sequence (0 → 10 → 20 → 30 → 40)",
      "All 5 calculators are registered and resolved from DI",
    ]},
    { section: "End-to-End Pipeline", items: [
      "No tier prices, no discounts, tax-exclusive USD → applies 10% tax then USD rate",
      "No tier prices, no discounts, tax-inclusive USD → price unchanged",
      "Tier price applies → discount then tax then currency run on reduced price",
      "Flat discount (coupon code) applies after tier price",
      "Percentage discount with MaximumDiscountAmount cap is enforced",
      "Currency conversion to INR is applied as final step",
      "Currency conversion to EUR rounds to 2 decimal places",
      "Pipeline returns DiscountAmount reflecting the discount applied",
      "DiscountAmount is 0 when no discount applies",
      "TaxAmount is 0 when IsTaxIncluded = true",
      "TaxAmount is non-zero when IsTaxIncluded = false",
      "Price never goes below 0 even with extreme discount",
    ]},
    { section: "Expired / Future-dated Rules", items: [
      "Expired tier price (EndDateTimeUtc in the past) is not applied",
      "Future-dated tier price (StartDateTimeUtc in the future) is not applied",
      "Expired discount is not applied",
      "Future-dated discount is not applied",
    ]},
    { section: "CurrencyCode in Result", items: [
      "result.CurrencyCode matches the requested CurrencyCode",
    ]},
  ],
  5: [
    { section: "TierPriceCalculator (Order = 10)", items: [
      "Applies the tier price that matches the requested quantity exactly",
      "Applies the best (lowest-price) tier when multiple tiers match",
      "Does NOT apply tier price if quantity is below minimum",
      "Does NOT apply tier price if it would result in a higher price",
      "Tier price scoped to a different StoreId is ignored",
      "Store-agnostic tier price (StoreId = null) applies to any store",
      "No tier prices in DB — returns currentPrice unchanged",
    ]},
    { section: "DiscountCalculator (Order = 20)", items: [
      "Applies flat-amount coupon discount when CouponCode matches",
      "Coupon code is case-insensitive",
      "Invalid coupon code does not apply discount",
      "Null CouponCode skips coupon-code discounts",
      "Applies automatic (non-coupon) percentage discount",
      "MaximumDiscountAmount cap is respected for percentage discount",
      "Discount does not push price below 0",
      "Expired discount is not applied",
      "No discounts in DB — returns currentPrice unchanged",
    ]},
    { section: "TaxCalculator (Order = 30)", items: [
      "IsTaxIncluded = true — returns currentPrice unchanged",
      "IsTaxIncluded = false — returns currentPrice × 1.10",
      "Handles zero price without NaN or exception",
      "Order property is 30",
    ]},
    { section: "CurrencyCalculator (Order = 40)", items: [
      "USD — rate is 1.0, price unchanged",
      "EUR — price multiplied by 0.92 and rounded to 2 decimal places",
      "GBP — price multiplied by 0.79",
      "INR — price multiplied by 83.50",
      "AUD — price multiplied by 1.54",
      "Unknown currency code defaults to USD (rate = 1.0)",
      "Exchange rate is cached — second call does NOT re-compute the rate",
      "Order property is 40",
    ]},
    { section: "BasePriceCalculator (Order = 0)", items: [
      "Returns BasePrice from request regardless of currentPrice passed in",
      "Order property is 0",
    ]},
  ],
};

export default function Issues() {
  const { data: issues = [], isLoading } = useQuery<GithubIssue[]>({
    queryKey: ["/api/issues"],
    queryFn: () => apiRequest("GET", "/api/issues").then(r => r.json()),
  });

  const totalTests = issues.reduce((s, i) => s + i.checkboxTotal, 0);
  const totalChecked = issues.reduce((s, i) => s + i.checkboxChecked, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">Integration Test Issues</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            GitHub · paragpatidar25/AMNNSPK · {issues.filter(i => i.state === "open").length} open issues
          </p>
        </div>
        <a
          href="https://github.com/paragpatidar25/AMNNSPK/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
          data-testid="link-all-issues"
        >
          <GitBranch size={13} />
          View on GitHub
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Summary bar */}
      {!isLoading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-semibold">Total Test Coverage</span>
              <span className="text-muted-foreground">{totalChecked}/{totalTests} complete</span>
            </div>
            <Progress value={(totalChecked / totalTests) * 100} className="h-2" data-testid="progress-total" />
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span><strong className="text-foreground">{totalTests}</strong> test cases</span>
              <span><strong className="text-foreground">{issues.length}</strong> issues</span>
              <span><strong className="text-emerald-600 dark:text-emerald-400">AuthController · SignInManager · CheckoutService · Pipeline · Calculators</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues list */}
      <div className="space-y-4">
        {isLoading
          ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          : issues.map(issue => {
            const details = ISSUE_DETAILS[issue.id];
            const labels: string[] = JSON.parse(issue.labels ?? "[]");
            const pct = issue.checkboxTotal > 0 ? Math.round((issue.checkboxChecked / issue.checkboxTotal) * 100) : 0;

            return (
              <Card key={issue.id} data-testid={`issue-card-${issue.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-primary flex items-start gap-1.5 group"
                        data-testid={`link-issue-${issue.id}`}
                      >
                        <span className="text-muted-foreground shrink-0">#{issue.id}</span>
                        <span className="group-hover:underline">{issue.title}</span>
                        <ExternalLink size={11} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
                      </a>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {labels.map(l => (
                          <span key={l} className={`${LABEL_STYLES[l] ?? "bg-muted text-muted-foreground"} text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1`}>
                            <Tag size={8} />
                            {l}
                          </span>
                        ))}
                        <Badge className={`status-${issue.state === "open" ? "open" : "closed"} text-[10px] px-1.5 border-0`}>
                          {issue.state}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold">{pct}%</div>
                      <div className="text-[10px] text-muted-foreground">{issue.checkboxChecked}/{issue.checkboxTotal}</div>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5 mt-2" />
                </CardHeader>

                {details && (
                  <CardContent className="pt-0 space-y-3">
                    {details.map(section => (
                      <div key={section.section}>
                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{section.section}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
                          {section.items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                              <Square size={11} className="text-muted-foreground mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })
        }
      </div>
    </div>
  );
}

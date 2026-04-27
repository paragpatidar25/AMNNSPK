// Ref: https://docs.nopcommerce.com/en/index.html — Discounts & Coupons
using GOE.Pricing.Domain.Entities;
using GOE.Pricing.Domain.Services;
using Microsoft.EntityFrameworkCore;

namespace GOE.Pricing.Application.Calculators;

/// <summary>
/// Step 3 — applies coupon codes and automatic product-level discounts.
/// </summary>
public class DiscountCalculator : IPriceCalculator
{
    private readonly IPricingDbContext _db;
    public int Order => 20;

    public DiscountCalculator(IPricingDbContext db) => _db = db;

    public async Task<decimal> CalculateAsync(
        PriceCalculationRequest request,
        decimal currentPrice,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var discounts = await _db.Discounts
            .Where(d => d.DiscountType == DiscountType.AssignedToProducts
                && (d.StartDateUtc == null || d.StartDateUtc <= now)
                && (d.EndDateUtc   == null || d.EndDateUtc   >= now))
            .ToListAsync(ct);

        // Apply coupon-code discount if provided
        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            var couponDiscount = discounts.FirstOrDefault(d =>
                d.RequiresCouponCode &&
                string.Equals(d.CouponCode, request.CouponCode, StringComparison.OrdinalIgnoreCase));

            if (couponDiscount is not null)
                currentPrice -= GetDiscountAmount(couponDiscount, currentPrice);
        }

        // Apply first matching automatic discount (non-cumulative)
        var autoDiscount = discounts.FirstOrDefault(d => !d.RequiresCouponCode);
        if (autoDiscount is not null)
            currentPrice -= GetDiscountAmount(autoDiscount, currentPrice);

        return Math.Max(0m, currentPrice);
    }

    private static decimal GetDiscountAmount(Discount d, decimal price)
    {
        if (d.UsePercentage)
        {
            var amount = price * d.DiscountPercentage / 100m;
            if (d.MaximumDiscountAmount.HasValue)
                amount = Math.Min(amount, d.MaximumDiscountAmount.Value);
            return amount;
        }
        return Math.Min(d.DiscountAmount, price);
    }
}

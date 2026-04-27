// Ref: https://docs.nopcommerce.com/en/index.html — Tier Pricing
using GOE.Pricing.Domain.Services;
using Microsoft.EntityFrameworkCore;

namespace GOE.Pricing.Application.Calculators;

/// <summary>
/// Step 2 — applies the best matching tier price for the requested quantity.
/// </summary>
public class TierPriceCalculator : IPriceCalculator
{
    private readonly IPricingDbContext _db;
    public int Order => 10;

    public TierPriceCalculator(IPricingDbContext db) => _db = db;

    public async Task<decimal> CalculateAsync(
        PriceCalculationRequest request,
        decimal currentPrice,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        // Load all applicable tier prices for this product
        var tierPrices = await _db.TierPrices
            .Where(tp => tp.ProductId == request.ProductId
                && tp.Quantity <= request.Quantity
                && (tp.StoreId == null || tp.StoreId == request.StoreId)
                && (tp.StartDateTimeUtc == null || tp.StartDateTimeUtc <= now)
                && (tp.EndDateTimeUtc   == null || tp.EndDateTimeUtc   >= now))
            .OrderByDescending(tp => tp.Quantity)
            .ToListAsync(ct);

        // Pick the tier with the lowest resulting price
        var bestTier = tierPrices
            .Where(tp => tp.CustomerRoleId == null || request.CustomerRoles.Any())
            .OrderBy(tp => tp.Price)
            .FirstOrDefault();

        return bestTier is not null && bestTier.Price < currentPrice
            ? bestTier.Price
            : currentPrice;
    }
}

// Minimal DB interface — avoids tight coupling to EF DbContext
public interface IPricingDbContext
{
    IQueryable<GOE.Catalog.Domain.Entities.TierPrice> TierPrices { get; }
    IQueryable<GOE.Pricing.Domain.Entities.Discount> Discounts { get; }
}

// Ref: https://docs.nopcommerce.com/en/index.html — Tax Providers
using GOE.Pricing.Domain.Services;

namespace GOE.Pricing.Application.Calculators;

/// <summary>
/// Step 4 — calculates tax using a flat-rate fallback (plug in Avalara or custom provider).
/// </summary>
public class TaxCalculator : IPriceCalculator
{
    private const decimal DefaultTaxRate = 0.10m; // 10% fallback
    public int Order => 30;

    public Task<decimal> CalculateAsync(
        PriceCalculationRequest request,
        decimal currentPrice,
        CancellationToken ct = default)
    {
        // If price is already tax-inclusive, return unchanged
        if (request.IsTaxIncluded)
            return Task.FromResult(currentPrice);

        return Task.FromResult(currentPrice * (1 + DefaultTaxRate));
    }
}

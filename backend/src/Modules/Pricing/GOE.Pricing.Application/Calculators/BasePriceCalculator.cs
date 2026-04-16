using GOE.Pricing.Domain.Services;

namespace GOE.Pricing.Application.Calculators;

/// <summary>Step 1 — sets the working price to the product's base price.</summary>
public class BasePriceCalculator : IPriceCalculator
{
    public int Order => 0;

    public Task<decimal> CalculateAsync(PriceCalculationRequest request, decimal currentPrice, CancellationToken ct = default)
        => Task.FromResult(request.BasePrice);
}

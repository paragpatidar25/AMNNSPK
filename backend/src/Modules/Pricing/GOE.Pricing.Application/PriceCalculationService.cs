using GOE.Pricing.Domain.Services;

namespace GOE.Pricing.Application;

/// <summary>
/// Orchestrates the composable price-calculation pipeline.
/// Smartstore IPriceCalculationService pattern.
/// </summary>
public class PriceCalculationService : IPriceCalculationService
{
    private readonly IEnumerable<IPriceCalculator> _calculators;

    public PriceCalculationService(IEnumerable<IPriceCalculator> calculators)
        => _calculators = calculators.OrderBy(c => c.Order);

    public async Task<PriceCalculationResult> CalculateAsync(
        PriceCalculationRequest request,
        CancellationToken ct = default)
    {
        decimal price = 0m;

        foreach (var calculator in _calculators)
            price = await calculator.CalculateAsync(request, price, ct);

        var taxAmount      = request.IsTaxIncluded ? 0m : price - (price / 1.10m); // reverse calc
        var discountAmount = request.BasePrice - (price / (request.IsTaxIncluded ? 1m : 1.10m));
        discountAmount     = Math.Max(0m, discountAmount);

        return new PriceCalculationResult(
            FinalPrice:           price,
            DiscountAmount:       discountAmount,
            TaxAmount:            taxAmount,
            CurrencyCode:         request.CurrencyCode,
            AppliedDiscountNames: []);
    }
}

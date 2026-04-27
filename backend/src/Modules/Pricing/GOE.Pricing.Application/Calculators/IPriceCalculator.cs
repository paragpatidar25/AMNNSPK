using GOE.Pricing.Domain.Services;

namespace GOE.Pricing.Application.Calculators;

/// <summary>
/// Single step in the price-calculation pipeline.
/// Inspired by Smartstore's composable calculator pattern.
/// </summary>
public interface IPriceCalculator
{
    /// <summary>Execution order — lower runs first.</summary>
    int Order { get; }

    Task<decimal> CalculateAsync(
        PriceCalculationRequest request,
        decimal currentPrice,
        CancellationToken ct = default);
}

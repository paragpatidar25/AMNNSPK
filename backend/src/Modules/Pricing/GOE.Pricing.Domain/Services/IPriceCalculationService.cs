// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore IPriceCalculationService pipeline — composable calculators

namespace GOE.Pricing.Domain.Services;

/// <summary>
/// Entry point for the composable pricing pipeline.
/// </summary>
public interface IPriceCalculationService
{
    Task<PriceCalculationResult> CalculateAsync(PriceCalculationRequest request, CancellationToken ct = default);
}

public record PriceCalculationRequest(
    int ProductId,
    decimal BasePrice,
    int Quantity,
    int CustomerId,
    IReadOnlyList<string> CustomerRoles,
    string CurrencyCode,
    string? CouponCode,
    bool IsTaxIncluded,
    int? StoreId);

public record PriceCalculationResult(
    decimal FinalPrice,
    decimal DiscountAmount,
    decimal TaxAmount,
    string CurrencyCode,
    IReadOnlyList<string> AppliedDiscountNames);

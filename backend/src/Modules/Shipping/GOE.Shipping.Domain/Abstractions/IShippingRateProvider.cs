// Ref: https://docs.nopcommerce.com/en/index.html — Shipping Rate Computation
namespace GOE.Shipping.Domain.Abstractions;

/// <summary>
/// Contract for shipping carrier adapters (FedEx, UPS, DHL, table rates, etc.)
/// </summary>
public interface IShippingRateProvider
{
    string SystemName { get; }
    string FriendlyName { get; }

    Task<IReadOnlyList<ShippingOption>> GetShippingOptionsAsync(
        ShippingOptionRequest request,
        CancellationToken ct = default);
}

public record ShippingOptionRequest(
    string OriginCountry,
    string OriginZip,
    string DestinationCountry,
    string DestinationZip,
    decimal TotalWeightKg,
    decimal TotalWidthCm,
    decimal TotalHeightCm,
    decimal TotalLengthCm);

public record ShippingOption(
    string Name,
    string Description,
    decimal Rate,
    string CurrencyCode,
    TimeSpan? EstimatedDelivery);

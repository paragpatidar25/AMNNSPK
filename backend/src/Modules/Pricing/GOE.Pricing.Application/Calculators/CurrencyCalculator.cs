using GOE.Pricing.Domain.Services;
using Microsoft.Extensions.Caching.Memory;

namespace GOE.Pricing.Application.Calculators;

/// <summary>
/// Step 5 — converts the final price to the requested currency using cached exchange rates.
/// </summary>
public class CurrencyCalculator : IPriceCalculator
{
    private readonly IMemoryCache _cache;
    public int Order => 40;

    public CurrencyCalculator(IMemoryCache cache) => _cache = cache;

    public Task<decimal> CalculateAsync(
        PriceCalculationRequest request,
        decimal currentPrice,
        CancellationToken ct = default)
    {
        // Base currency is USD — rates cached from an external provider
        var rate = _cache.GetOrCreate($"rate_{request.CurrencyCode}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            // Fallback rates — replace with live ECB / OpenExchangeRates call
            return request.CurrencyCode switch
            {
                "EUR" => 0.92m,
                "GBP" => 0.79m,
                "INR" => 83.50m,
                "AUD" => 1.54m,
                _     => 1.00m  // USD
            };
        });

        return Task.FromResult(Math.Round(currentPrice * rate, 2));
    }
}

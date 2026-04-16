// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore IStoreContext HTTP-request-scoped implementation

using GOE.Shared.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace GOE.Identity.Application.Services;

public sealed class StoreContext : IStoreContext
{
    private readonly IHttpContextAccessor _http;
    private readonly IMemoryCache _cache;

    public StoreContext(IHttpContextAccessor http, IMemoryCache cache)
    {
        _http  = http;
        _cache = cache;
    }

    public async Task<StoreInfo> GetCurrentStoreAsync(CancellationToken ct = default)
    {
        var host = _http.HttpContext?.Request.Host.Host ?? "localhost";
        var stores = await GetAllStoresAsync(ct);
        return stores.FirstOrDefault(s => s.Host.Equals(host, StringComparison.OrdinalIgnoreCase))
               ?? stores.First(); // fallback to first store
    }

    public Task<IReadOnlyList<StoreInfo>> GetAllStoresAsync(CancellationToken ct = default)
    {
        // In production this is loaded from DB and cached.
        var cached = _cache.GetOrCreate("goe_stores", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            return (IReadOnlyList<StoreInfo>)
            [
                new StoreInfo(1, "GOE Storefront", "localhost", "USD", "en-US", false)
            ];
        });
        return Task.FromResult(cached!);
    }
}

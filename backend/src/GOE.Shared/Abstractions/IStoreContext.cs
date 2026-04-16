// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore IStoreContext — resolves current store from host header

namespace GOE.Shared.Abstractions;

/// <summary>
/// Resolves the active store for the current request (multi-store aware).
/// Equivalent to Smartstore's IStoreContext.
/// </summary>
public interface IStoreContext
{
    /// <summary>Returns the store resolved from the HTTP Host header.</summary>
    Task<StoreInfo> GetCurrentStoreAsync(CancellationToken ct = default);

    /// <summary>Returns all configured stores.</summary>
    Task<IReadOnlyList<StoreInfo>> GetAllStoresAsync(CancellationToken ct = default);
}

public record StoreInfo(
    int StoreId,
    string Name,
    string Host,
    string DefaultCurrency,
    string DefaultLanguage,
    bool SslEnabled);

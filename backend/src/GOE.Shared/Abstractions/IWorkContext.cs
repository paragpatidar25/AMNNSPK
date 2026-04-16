// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore IWorkContext — current customer/language/currency per request

namespace GOE.Shared.Abstractions;

/// <summary>
/// Provides access to the current customer, language, currency, and tax display type.
/// Equivalent to Smartstore's IWorkContext.
/// </summary>
public interface IWorkContext
{
    /// <summary>Gets the currently authenticated (or guest) customer.</summary>
    Task<CustomerContext> GetCurrentCustomerAsync(CancellationToken ct = default);

    /// <summary>Gets the active language ISO code (e.g. "en-US").</summary>
    string CurrentLanguage { get; }

    /// <summary>Gets the active currency ISO code (e.g. "USD").</summary>
    string CurrentCurrency { get; }

    /// <summary>Indicates whether tax should be shown inclusive or exclusive.</summary>
    TaxDisplayType TaxDisplayType { get; }

    /// <summary>True when current request is made on behalf of a vendor.</summary>
    bool IsVendorContext { get; }
}

public record CustomerContext(int CustomerId, string Email, bool IsGuest, IReadOnlyList<string> Roles);

public enum TaxDisplayType { IncludingTax, ExcludingTax }

// Ref: https://docs.nopcommerce.com/en/index.html — Payment Providers (50+ gateway pattern)
namespace GOE.Payment.Domain.Abstractions;

/// <summary>
/// Contract that every GOE payment adapter must implement.
/// Mirrors nopCommerce IPaymentMethod.
/// </summary>
public interface IPaymentMethod
{
    /// <summary>Unique system name, e.g. "Payments.Stripe".</summary>
    string SystemName { get; }

    /// <summary>Human-readable name shown in admin/storefront.</summary>
    string FriendlyName { get; }

    /// <summary>Whether the gateway supports recurring/subscription billing.</summary>
    bool SupportRecurring { get; }

    /// <summary>Whether the gateway supports refunds from the admin.</summary>
    bool SupportRefund { get; }

    /// <summary>Whether the gateway supports partial refunds.</summary>
    bool SupportPartiallyRefund { get; }

    /// <summary>Whether the gateway supports void (pre-capture cancel).</summary>
    bool SupportVoid { get; }

    /// <summary>Initiates a payment — returns provider-specific redirect URL or token.</summary>
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request, CancellationToken ct = default);

    /// <summary>Captures a previously authorized payment.</summary>
    Task<PaymentResult> CaptureAsync(string authorizationTransactionId, decimal amount, CancellationToken ct = default);

    /// <summary>Issues a full or partial refund.</summary>
    Task<PaymentResult> RefundAsync(string captureTransactionId, decimal amountToRefund, CancellationToken ct = default);

    /// <summary>Voids an authorized (but not yet captured) payment.</summary>
    Task<PaymentResult> VoidAsync(string authorizationTransactionId, CancellationToken ct = default);

    /// <summary>Processes incoming webhooks from the provider.</summary>
    Task<WebhookProcessResult> ProcessWebhookAsync(WebhookPayload payload, CancellationToken ct = default);
}

public record PaymentRequest(
    int OrderId,
    decimal Amount,
    string CurrencyCode,
    string CustomerEmail,
    string BillingAddressJson,
    IDictionary<string, string> ExtraData);

public record PaymentResult(bool Success, string? TransactionId, string? RedirectUrl, string? Error);

public record WebhookPayload(string ProviderName, string EventType, string RawBody, IDictionary<string, string> Headers);
public record WebhookProcessResult(bool Processed, string? OrderId, string? Error);

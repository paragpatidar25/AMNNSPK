using GOE.Shared.Domain;

namespace GOE.Payment.Domain.Entities;

public class PaymentTransaction : AuditableEntity
{
    public int OrderId { get; set; }
    public string PaymentMethodSystemName { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public PaymentTransactionStatus Status { get; set; } = PaymentTransactionStatus.Pending;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public string? ErrorMessage { get; set; }
    public string? ProviderRawResponse { get; set; }
}

public enum PaymentTransactionStatus
{
    Pending    = 0,
    Authorized = 1,
    Captured   = 2,
    Refunded   = 3,
    Voided     = 4,
    Failed     = 5
}

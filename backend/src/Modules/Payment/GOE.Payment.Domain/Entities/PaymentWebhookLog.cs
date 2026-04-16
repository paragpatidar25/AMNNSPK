using GOE.Shared.Domain;

namespace GOE.Payment.Domain.Entities;

public class PaymentWebhookLog : BaseEntity
{
    public string ProviderSystemName { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string RawBody { get; set; } = string.Empty;
    public bool Processed { get; set; }
    public string? Error { get; set; }
    public DateTime ReceivedOnUtc { get; set; } = DateTime.UtcNow;
}

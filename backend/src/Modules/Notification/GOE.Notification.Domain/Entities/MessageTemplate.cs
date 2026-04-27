// Ref: https://dev.smartstore.com/framework/platform/identity — Liquid template engine (Fluid)
using GOE.Shared.Domain;

namespace GOE.Notification.Domain.Entities;

/// <summary>
/// Reusable message template with Liquid (Fluid) placeholders.
/// </summary>
public class MessageTemplate : AuditableEntity
{
    public string Name { get; set; } = string.Empty;          // e.g. "Order.Placed.CustomerNotification"
    public string? BccEmailAddresses { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;          // Liquid template
    public bool IsActive { get; set; } = true;
    public int? DelayBeforeSend { get; set; }                 // hours
    public int? LimitedToStoreId { get; set; }
    public string? EmailAccountSystemName { get; set; }
}

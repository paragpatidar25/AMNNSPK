using GOE.Shared.Domain;

namespace GOE.Identity.Domain.Entities;

/// <summary>
/// Tracks GDPR consent records per customer per consent topic.
/// </summary>
public class GdprConsent : BaseEntity
{
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string ConsentTopic { get; set; } = string.Empty;
    public bool Accepted { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
}

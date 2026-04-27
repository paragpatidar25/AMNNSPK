using GOE.Shared.Domain;

namespace GOE.Identity.Domain.Entities;

public class ActivityLog : BaseEntity
{
    public int ActivityLogTypeId { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string Comment { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
}

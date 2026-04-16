namespace GOE.Shared.Domain;

/// <summary>
/// Extends BaseEntity with audit timestamps and soft-delete support.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedOnUtc { get; set; } = DateTime.UtcNow;
    public bool Deleted { get; set; }
}

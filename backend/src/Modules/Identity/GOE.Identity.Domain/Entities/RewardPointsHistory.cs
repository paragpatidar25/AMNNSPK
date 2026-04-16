// Ref: https://docs.nopcommerce.com/en/index.html — Reward Points
using GOE.Shared.Domain;

namespace GOE.Identity.Domain.Entities;

public class RewardPointsHistory : BaseEntity
{
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int StoreId { get; set; }
    public int Points { get; set; }
    public int PointsBalance { get; set; }
    public decimal UsedAmount { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
    public DateTime? EndDateUtc { get; set; }
    public bool ValidityLimitedToDate => EndDateUtc.HasValue;
}

using GOE.Shared.Domain;

namespace GOE.Vendor.Domain.Entities;

public class VendorCommissionRule : BaseEntity
{
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public int? CategoryId { get; set; }
    public int? ProductId { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public DateTime? StartDateUtc { get; set; }
    public DateTime? EndDateUtc { get; set; }
}

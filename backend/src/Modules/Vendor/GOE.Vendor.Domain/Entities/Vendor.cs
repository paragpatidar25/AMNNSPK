// Ref: https://docs.nopcommerce.com/en/index.html — Multi-Vendor Marketplace
using GOE.Shared.Domain;

namespace GOE.Vendor.Domain.Entities;

public class Vendor : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Description { get; set; }
    public string? PictureUrl { get; set; }
    public string? AdminComment { get; set; }
    public bool Active { get; set; } = true;
    public bool DisplayContactDetails { get; set; }
    public int DisplayOrder { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? MetaKeywords { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaTitle { get; set; }
    public decimal CommissionPercentage { get; set; }
    public ICollection<VendorCommissionRule> CommissionRules { get; set; } = [];
    public ICollection<VendorPayoutRecord> PayoutRecords { get; set; } = [];
}

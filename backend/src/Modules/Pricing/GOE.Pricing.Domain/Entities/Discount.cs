// Ref: https://docs.nopcommerce.com/en/index.html — Discounts & Promotions
using GOE.Shared.Domain;

namespace GOE.Pricing.Domain.Entities;

public class Discount : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public bool UsePercentage { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal? MaximumDiscountAmount { get; set; }
    public DateTime? StartDateUtc { get; set; }
    public DateTime? EndDateUtc { get; set; }
    public bool RequiresCouponCode { get; set; }
    public string? CouponCode { get; set; }
    public bool IsCumulative { get; set; }
    public int DiscountLimitationId { get; set; }
    public int LimitationTimes { get; set; }
    public int? MaximumDiscountedQuantity { get; set; }
    public bool AppliedToSubCategories { get; set; }
}

public enum DiscountType
{
    AssignedToOrderTotal  = 1,
    AssignedToProducts    = 2,
    AssignedToCategories  = 5,
    AssignedToManufacturers = 6,
    AssignedToShipping    = 10
}

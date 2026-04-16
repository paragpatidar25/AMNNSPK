// Ref: https://docs.nopcommerce.com/en/index.html — Tier Pricing
using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

/// <summary>
/// Volume-based tier price for a product.
/// </summary>
public class TierPrice : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int? StoreId { get; set; }
    public int? CustomerRoleId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime? StartDateTimeUtc { get; set; }
    public DateTime? EndDateTimeUtc { get; set; }
}

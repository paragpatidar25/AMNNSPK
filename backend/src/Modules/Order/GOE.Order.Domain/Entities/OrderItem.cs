using GOE.Shared.Domain;

namespace GOE.Order.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderItemGuid { get; set; } = Guid.NewGuid();
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceInclTax { get; set; }
    public decimal UnitPriceExclTax { get; set; }
    public decimal PriceInclTax { get; set; }
    public decimal PriceExclTax { get; set; }
    public decimal DiscountAmountInclTax { get; set; }
    public decimal DiscountAmountExclTax { get; set; }
    public decimal OriginalProductCost { get; set; }
    public string? AttributeDescription { get; set; }
    public string? AttributesJson { get; set; }
    public int? DownloadCount { get; set; }
    public bool IsDownloadActivated { get; set; }
}

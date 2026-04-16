using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

/// <summary>
/// Represents a specific combination of attribute values (e.g. Red + Large),
/// allowing per-combination stock, price, and SKU overrides.
/// </summary>
public class ProductAttributeCombination : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>JSON-serialised attribute selection (attributeId → valueId[]).</summary>
    public string AttributesJson { get; set; } = "{}";

    public string? Sku { get; set; }
    public string? Gtin { get; set; }
    public string? ManufacturerPartNumber { get; set; }
    public int StockQuantity { get; set; }
    public bool AllowOutOfStockOrders { get; set; }
    public decimal? OverriddenPrice { get; set; }
    public string? PictureUrl { get; set; }
}

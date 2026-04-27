using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

/// <summary>Defines a product attribute mapping (e.g. "Color", "Size").</summary>
public class ProductAttribute : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsRequired { get; set; }
    public int DisplayOrder { get; set; }
    public ICollection<ProductAttributeValue> Values { get; set; } = [];
}

public class ProductAttributeValue : BaseEntity
{
    public int ProductAttributeId { get; set; }
    public ProductAttribute ProductAttribute { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? ColorSquaresRgb { get; set; }
    public decimal PriceAdjustment { get; set; }
    public decimal WeightAdjustment { get; set; }
    public bool IsPreSelected { get; set; }
    public int DisplayOrder { get; set; }
}

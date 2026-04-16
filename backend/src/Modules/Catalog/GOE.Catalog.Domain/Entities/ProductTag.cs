using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

public class ProductTag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public ICollection<Product> Products { get; set; } = [];
}

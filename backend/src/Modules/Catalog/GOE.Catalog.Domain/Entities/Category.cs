using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

public class Category : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? MetaKeywords { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaTitle { get; set; }
    public string Slug { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public string? PictureUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool Published { get; set; } = true;
    public bool SubjectToAcl { get; set; }
    public bool LimitedToStores { get; set; }
    public bool ShowOnHomepage { get; set; }
    public bool IncludeInTopMenu { get; set; } = true;
    public bool HasDiscountsApplied { get; set; }
    public int PageSize { get; set; } = 6;
    public bool AllowCustomersToSelectPageSize { get; set; } = true;
    public string PageSizeOptions { get; set; } = "6, 3, 9";
    public ICollection<ProductCategory> ProductCategories { get; set; } = [];
}

public class ProductCategory : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsFeaturedProduct { get; set; }
    public int DisplayOrder { get; set; }
}

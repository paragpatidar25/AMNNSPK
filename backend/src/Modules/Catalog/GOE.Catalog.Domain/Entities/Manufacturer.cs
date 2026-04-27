using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

public class Manufacturer : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PictureUrl { get; set; }
    public string Slug { get; set; } = string.Empty;
    public bool Published { get; set; } = true;
    public int DisplayOrder { get; set; }
    public string? MetaKeywords { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaTitle { get; set; }
}

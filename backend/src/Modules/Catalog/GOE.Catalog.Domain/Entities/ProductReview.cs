using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

public class ProductReview : AuditableEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int CustomerId { get; set; }
    public int StoreId { get; set; }
    public bool IsApproved { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ReviewText { get; set; } = string.Empty;
    public int Rating { get; set; } // 1–5
    public int HelpfulYesTotal { get; set; }
    public int HelpfulNoTotal { get; set; }
}

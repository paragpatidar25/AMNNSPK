// Ref: https://docs.nopcommerce.com/en/index.html + https://dev.smartstore.com/framework/platform/identity
// Pattern: nopCommerce Product entity with Smartstore datasheet extensions

using GOE.Catalog.Domain.Enums;
using GOE.Shared.Domain;

namespace GOE.Catalog.Domain.Entities;

/// <summary>
/// Core product aggregate root for the GOE catalog.
/// </summary>
public class Product : AuditableEntity
{
    public ProductType ProductType { get; set; } = ProductType.SimpleProduct;
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? FullDescription { get; set; }
    public string? AdminComment { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? Gtin { get; set; }
    public string? ManufacturerPartNumber { get; set; }
    public bool Published { get; set; } = true;
    public bool ShowOnHomepage { get; set; }
    public bool IsFeatured { get; set; }
    public bool AllowCustomerReviews { get; set; } = true;
    public int ApprovedRatingSum { get; set; }
    public int NotApprovedRatingSum { get; set; }
    public int ApprovedTotalReviews { get; set; }
    public int NotApprovedTotalReviews { get; set; }
    public bool SubjectToAcl { get; set; }
    public bool LimitedToStores { get; set; }

    // Pricing
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public decimal? ProductCost { get; set; }
    public bool CallForPrice { get; set; }
    public bool CustomerEntersPrice { get; set; }
    public decimal? MinimumCustomerEnteredPrice { get; set; }
    public decimal? MaximumCustomerEnteredPrice { get; set; }
    public bool BasepriceEnabled { get; set; }
    public decimal BasepriceAmount { get; set; }

    // Inventory
    public int StockQuantity { get; set; }
    public bool DisplayStockAvailability { get; set; } = true;
    public bool DisplayStockQuantity { get; set; }
    public int MinStockQuantity { get; set; }
    public BackorderMode BackorderMode { get; set; } = BackorderMode.NoBackorders;
    public bool AllowBackInStockSubscriptions { get; set; }
    public int OrderMinimumQuantity { get; set; } = 1;
    public int OrderMaximumQuantity { get; set; } = 10000;
    public bool NotifyAdminForQuantityBelow { get; set; }
    public int NotifyAdminForQuantityBelowValue { get; set; }

    // Shipping
    public bool IsShipEnabled { get; set; } = true;
    public bool IsFreeShipping { get; set; }
    public bool ShipSeparately { get; set; }
    public decimal? AdditionalShippingCharge { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }

    // Tax
    public bool IsTaxExempt { get; set; }
    public int TaxCategoryId { get; set; }

    // SEO
    public string? MetaKeywords { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaTitle { get; set; }
    public string Slug { get; set; } = string.Empty;

    // Relations
    public int? VendorId { get; set; }
    public ICollection<ProductCategory> ProductCategories { get; set; } = [];
    public ICollection<ProductAttribute> ProductAttributes { get; set; } = [];
    public ICollection<ProductAttributeCombination> AttributeCombinations { get; set; } = [];
    public ICollection<TierPrice> TierPrices { get; set; } = [];
    public ICollection<ProductTag> ProductTags { get; set; } = [];
    public ICollection<ProductReview> ProductReviews { get; set; } = [];
}

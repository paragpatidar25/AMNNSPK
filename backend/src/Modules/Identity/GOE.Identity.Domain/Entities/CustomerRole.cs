using GOE.Shared.Domain;

namespace GOE.Identity.Domain.Entities;

/// <summary>
/// Role assigned to a customer for ACL.
/// Mirrors nopCommerce CustomerRole.
/// </summary>
public class CustomerRole : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string SystemName { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
    public bool IsSystemRole { get; set; }
    public bool FreeShipping { get; set; }
    public bool TaxExempt { get; set; }
    public bool OverrideTaxDisplayType { get; set; }
    public int? DefaultTaxDisplayTypeId { get; set; }
    public decimal? PurchasedWithProductId { get; set; }
    public ICollection<Customer> Customers { get; set; } = [];
}

public static class SystemCustomerRoleNames
{
    public const string Administrators = "Administrators";
    public const string Moderators     = "Moderators";
    public const string Registered     = "Registered";
    public const string Guests         = "Guests";
    public const string Vendors        = "Vendors";
}

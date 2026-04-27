// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore Customer entity + nopCommerce ACL roles

using GOE.Shared.Domain;

namespace GOE.Identity.Domain.Entities;

/// <summary>
/// Represents a registered or guest customer in the GOE platform.
/// </summary>
public class Customer : AuditableEntity
{
    public Guid CustomerGuid { get; set; } = Guid.NewGuid();
    public string? Username { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsGuest { get; set; }
    public bool IsSystemAccount { get; set; }
    public string? SystemName { get; set; }
    public bool Active { get; set; } = true;
    public bool RequireReLogin { get; set; }
    public bool CannotLoginUntilDateUtc { get; set; }
    public DateTime? LastLoginDateUtc { get; set; }
    public DateTime? LastActivityDateUtc { get; set; }
    public string? LastIpAddress { get; set; }
    public string? AdminComment { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEndDateUtc { get; set; }

    // Multi-store
    public int? RegisteredInStoreId { get; set; }

    // ACL navigation
    public ICollection<CustomerRole> CustomerRoles { get; set; } = [];
    public ICollection<CustomerAddress> Addresses { get; set; } = [];
    public ICollection<ExternalAuthenticationRecord> ExternalAuthRecords { get; set; } = [];
    public ICollection<RewardPointsHistory> RewardPointsHistory { get; set; } = [];
    public ICollection<GdprConsent> GdprConsents { get; set; } = [];
}

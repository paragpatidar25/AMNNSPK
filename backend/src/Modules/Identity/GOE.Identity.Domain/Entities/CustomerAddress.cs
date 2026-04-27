using GOE.Shared.Domain;

namespace GOE.Identity.Domain.Entities;

public class CustomerAddress : BaseEntity
{
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string Address1 { get; set; } = string.Empty;
    public string? Address2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string? StateProvince { get; set; }
    public string ZipPostalCode { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
}

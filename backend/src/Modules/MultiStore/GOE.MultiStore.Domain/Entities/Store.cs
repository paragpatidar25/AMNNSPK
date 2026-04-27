// Ref: https://docs.nopcommerce.com/en/index.html — Multi-Store + Smartstore IStoreContext
using GOE.Shared.Domain;

namespace GOE.MultiStore.Domain.Entities;

public class Store : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public bool SslEnabled { get; set; }
    public string Hosts { get; set; } = string.Empty;  // comma-separated host aliases
    public string DefaultLanguageId { get; set; } = "en-US";
    public string DefaultCurrencyCode { get; set; } = "USD";
    public int DisplayOrder { get; set; }
    public string? LogoUrl { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyAddress { get; set; }
    public string? CompanyPhone { get; set; }
    public string? CompanyVat { get; set; }
    public ICollection<StoreSettingOverride> SettingOverrides { get; set; } = [];
}

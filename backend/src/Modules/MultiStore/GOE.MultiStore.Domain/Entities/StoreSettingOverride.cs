using GOE.Shared.Domain;

namespace GOE.MultiStore.Domain.Entities;

/// <summary>Per-store setting override — allows each storefront to have different configuration.</summary>
public class StoreSettingOverride : BaseEntity
{
    public int StoreId { get; set; }
    public Store Store { get; set; } = null!;
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
}

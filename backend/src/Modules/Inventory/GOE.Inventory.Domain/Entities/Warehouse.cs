using GOE.Shared.Domain;

namespace GOE.Inventory.Domain.Entities;

public class Warehouse : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? AdminComment { get; set; }
    public string AddressJson { get; set; } = "{}";
    public ICollection<StockItem> StockItems { get; set; } = [];
    public ICollection<StockMovement> StockMovements { get; set; } = [];
}

// Ref: https://docs.nopcommerce.com/en/index.html — Multi-warehouse Inventory
using GOE.Shared.Domain;

namespace GOE.Inventory.Domain.Entities;

public class StockItem : AuditableEntity
{
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public int StockQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int PlannedQuantity { get; set; }
    public int AvailableQuantity => StockQuantity - ReservedQuantity;
}

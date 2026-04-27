using GOE.Shared.Domain;

namespace GOE.Inventory.Domain.Entities;

public class StockMovement : BaseEntity
{
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public int QuantityDelta { get; set; }
    public StockMovementType MovementType { get; set; }
    public string? Note { get; set; }
    public int? OrderId { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
}

public enum StockMovementType
{
    Purchase    = 1,
    Sale        = 2,
    Adjustment  = 3,
    Return      = 4,
    Transfer    = 5
}

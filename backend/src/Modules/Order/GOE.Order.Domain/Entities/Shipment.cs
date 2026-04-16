using GOE.Shared.Domain;

namespace GOE.Order.Domain.Entities;

public class Shipment : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public decimal? TotalWeight { get; set; }
    public DateTime? ShippedDateUtc { get; set; }
    public DateTime? DeliveryDateUtc { get; set; }
    public string? AdminComment { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
    public ICollection<ShipmentItem> ShipmentItems { get; set; } = [];
}

public class ShipmentItem : BaseEntity
{
    public int ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;
    public int OrderItemId { get; set; }
    public int Quantity { get; set; }
    public int? WarehouseId { get; set; }
}

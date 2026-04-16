// Ref: https://docs.nopcommerce.com/en/index.html — Return Requests (RMA)
using GOE.Order.Domain.Enums;
using GOE.Shared.Domain;

namespace GOE.Order.Domain.Entities;

public class ReturnRequest : AuditableEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int OrderItemId { get; set; }
    public int CustomerId { get; set; }
    public int Quantity { get; set; }
    public string ReasonForReturn { get; set; } = string.Empty;
    public string RequestedAction { get; set; } = string.Empty;
    public string? CustomerComments { get; set; }
    public string? StaffNotes { get; set; }
    public ReturnRequestStatus ReturnRequestStatus { get; set; } = ReturnRequestStatus.Pending;
}

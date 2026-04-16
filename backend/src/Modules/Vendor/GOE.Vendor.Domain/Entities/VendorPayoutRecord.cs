using GOE.Shared.Domain;

namespace GOE.Vendor.Domain.Entities;

public class VendorPayoutRecord : BaseEntity
{
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public PayoutStatus Status { get; set; } = PayoutStatus.Pending;
    public string? TransactionReference { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
    public DateTime? PaidOnUtc { get; set; }
}

public enum PayoutStatus { Pending, Processing, Paid, Failed }

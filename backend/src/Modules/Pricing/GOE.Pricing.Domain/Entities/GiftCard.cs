// Ref: https://docs.nopcommerce.com/en/index.html — Gift Cards
using GOE.Shared.Domain;

namespace GOE.Pricing.Domain.Entities;

public class GiftCard : AuditableEntity
{
    public GiftCardType GiftCardType { get; set; }
    public decimal Amount { get; set; }
    public bool IsGiftCardActivated { get; set; }
    public string GiftCardCouponCode { get; set; } = string.Empty;
    public string? RecipientName { get; set; }
    public string? RecipientEmail { get; set; }
    public string? SenderName { get; set; }
    public string? SenderEmail { get; set; }
    public string? Message { get; set; }
    public bool IsRecipientNotified { get; set; }
    public ICollection<GiftCardUsageHistory> UsageHistory { get; set; } = [];
}

public enum GiftCardType { Virtual = 0, Physical = 1 }

public class GiftCardUsageHistory : BaseEntity
{
    public int GiftCardId { get; set; }
    public GiftCard GiftCard { get; set; } = null!;
    public int UsedWithOrderId { get; set; }
    public decimal UsedValue { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
}

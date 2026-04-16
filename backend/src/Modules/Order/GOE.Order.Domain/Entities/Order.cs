// Ref: https://docs.nopcommerce.com/en/index.html — Order Management
using GOE.Order.Domain.Enums;
using GOE.Shared.Domain;

namespace GOE.Order.Domain.Entities;

public class Order : AuditableEntity
{
    public Guid OrderGuid { get; set; } = Guid.NewGuid();
    public int CustomerId { get; set; }
    public int StoreId { get; set; }
    public bool IsGuest { get; set; }

    // Status
    public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public ShippingStatus ShippingStatus { get; set; } = ShippingStatus.NotYetShipped;

    // Pricing summary
    public decimal OrderSubtotalInclTax { get; set; }
    public decimal OrderSubtotalExclTax { get; set; }
    public decimal OrderSubTotalDiscountInclTax { get; set; }
    public decimal OrderShippingInclTax { get; set; }
    public decimal OrderShippingExclTax { get; set; }
    public decimal PaymentMethodAdditionalFeeInclTax { get; set; }
    public decimal TaxRates { get; set; }
    public decimal OrderTax { get; set; }
    public decimal OrderDiscount { get; set; }
    public decimal OrderTotal { get; set; }
    public decimal RefundedAmount { get; set; }
    public decimal RewardPointsHistoryEntryAmount { get; set; }
    public int RedeemedRewardPoints { get; set; }
    public decimal RedeemedRewardPointsAmount { get; set; }

    // Payment
    public string? PaymentMethodSystemName { get; set; }
    public string? AuthorizationTransactionId { get; set; }
    public string? CaptureTransactionId { get; set; }
    public string? SubscriptionTransactionId { get; set; }
    public DateTime? PaidDateUtc { get; set; }

    // Addresses (denormalised snapshot at time of order)
    public string BillingAddressJson { get; set; } = "{}";
    public string? ShippingAddressJson { get; set; }
    public string? ShippingMethod { get; set; }

    // Currency
    public string CurrencyRate { get; set; } = "1";
    public string CustomerCurrencyCode { get; set; } = "USD";

    // Admin notes
    public string? CustomerIp { get; set; }
    public string? CustomerComment { get; set; }
    public string? InternalNote { get; set; }

    // Navigation
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public ICollection<Shipment> Shipments { get; set; } = [];
    public ICollection<ReturnRequest> ReturnRequests { get; set; } = [];
}

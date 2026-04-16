namespace GOE.Order.Domain.Enums;

// Ref: https://docs.nopcommerce.com/en/index.html — Order Lifecycle
public enum OrderStatus
{
    Pending         = 10,
    Processing      = 20,
    Complete        = 30,
    Cancelled       = 40
}

public enum PaymentStatus
{
    Pending         = 10,
    Authorized      = 20,
    Paid            = 30,
    PartiallyRefunded = 35,
    Refunded        = 40,
    Voided          = 50
}

public enum ShippingStatus
{
    ShippingNotRequired = 10,
    NotYetShipped       = 20,
    PartiallyShipped    = 25,
    Shipped             = 30,
    Delivered           = 40
}

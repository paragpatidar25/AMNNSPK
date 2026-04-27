// Ref: https://docs.nopcommerce.com/en/index.html — Order Placement
using GOE.Order.Domain.Entities;
using GOE.Order.Domain.Enums;
using GOE.Shared.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GOE.Order.Application.Commands;

public record PlaceOrderCommand(
    int CustomerId,
    int StoreId,
    bool IsGuest,
    string BillingAddressJson,
    string? ShippingAddressJson,
    string? ShippingMethod,
    string PaymentMethodSystemName,
    string CurrencyCode,
    IReadOnlyList<OrderLineRequest> Lines) : IRequest<Result<int>>;

public record OrderLineRequest(int ProductId, int Quantity, decimal UnitPriceInclTax, string? AttributesJson);

public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, Result<int>>
{
    private readonly IOrderDbContext _db;

    public PlaceOrderCommandHandler(IOrderDbContext db) => _db = db;

    public async Task<Result<int>> Handle(PlaceOrderCommand req, CancellationToken ct)
    {
        if (req.Lines.Count == 0)
            return Result<int>.Failure("Order must contain at least one item.");

        var order = new Order
        {
            CustomerId                = req.CustomerId,
            StoreId                   = req.StoreId,
            IsGuest                   = req.IsGuest,
            BillingAddressJson        = req.BillingAddressJson,
            ShippingAddressJson       = req.ShippingAddressJson,
            ShippingMethod            = req.ShippingMethod,
            PaymentMethodSystemName   = req.PaymentMethodSystemName,
            CustomerCurrencyCode      = req.CurrencyCode,
            OrderStatus               = OrderStatus.Pending,
            PaymentStatus             = PaymentStatus.Pending,
            ShippingStatus            = string.IsNullOrEmpty(req.ShippingMethod)
                ? ShippingStatus.ShippingNotRequired
                : ShippingStatus.NotYetShipped,
            CreatedOnUtc = DateTime.UtcNow
        };

        foreach (var line in req.Lines)
        {
            var item = new OrderItem
            {
                ProductId          = line.ProductId,
                Quantity           = line.Quantity,
                UnitPriceInclTax   = line.UnitPriceInclTax,
                UnitPriceExclTax   = line.UnitPriceInclTax / 1.10m,
                PriceInclTax       = line.UnitPriceInclTax * line.Quantity,
                PriceExclTax       = (line.UnitPriceInclTax / 1.10m) * line.Quantity,
                AttributesJson     = line.AttributesJson
            };
            order.OrderItems.Add(item);
        }

        order.OrderSubtotalInclTax = order.OrderItems.Sum(i => i.PriceInclTax);
        order.OrderTax             = order.OrderItems.Sum(i => i.PriceInclTax - i.PriceExclTax);
        order.OrderTotal           = order.OrderSubtotalInclTax;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        return Result<int>.Success(order.Id);
    }
}

public interface IOrderDbContext
{
    DbSet<Order> Orders { get; }
    DbSet<ReturnRequest> ReturnRequests { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

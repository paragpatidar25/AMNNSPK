using GOE.Order.Domain.Enums;
using GOE.Shared.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GOE.Order.Application.Commands;

public record CancelOrderCommand(int OrderId, string? Reason) : IRequest<Result>;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, Result>
{
    private readonly IOrderDbContext _db;

    public CancelOrderCommandHandler(IOrderDbContext db) => _db = db;

    public async Task<Result> Handle(CancelOrderCommand req, CancellationToken ct)
    {
        var order = await _db.Orders.FindAsync(new object[] { req.OrderId }, ct);
        if (order is null)
            return Result.Failure("Order not found.");

        if (order.OrderStatus is OrderStatus.Complete or OrderStatus.Cancelled)
            return Result.Failure($"Cannot cancel an order in status '{order.OrderStatus}'.");

        order.OrderStatus   = OrderStatus.Cancelled;
        order.InternalNote  = req.Reason;
        order.UpdatedOnUtc  = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}

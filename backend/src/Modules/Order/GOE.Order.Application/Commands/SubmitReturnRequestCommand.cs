// Ref: https://docs.nopcommerce.com/en/index.html — Return Requests
using GOE.Order.Domain.Entities;
using GOE.Order.Domain.Enums;
using GOE.Shared.Results;
using MediatR;

namespace GOE.Order.Application.Commands;

public record SubmitReturnRequestCommand(
    int OrderId,
    int OrderItemId,
    int CustomerId,
    int Quantity,
    string ReasonForReturn,
    string RequestedAction,
    string? CustomerComments) : IRequest<Result<int>>;

public class SubmitReturnRequestCommandHandler : IRequestHandler<SubmitReturnRequestCommand, Result<int>>
{
    private readonly IOrderDbContext _db;

    public SubmitReturnRequestCommandHandler(IOrderDbContext db) => _db = db;

    public async Task<Result<int>> Handle(SubmitReturnRequestCommand req, CancellationToken ct)
    {
        var order = await _db.Orders.FindAsync(new object[] { req.OrderId }, ct);
        if (order is null) return Result<int>.Failure("Order not found.");
        if (order.OrderStatus != OrderStatus.Complete)
            return Result<int>.Failure("Return requests can only be submitted for completed orders.");

        var returnRequest = new ReturnRequest
        {
            OrderId              = req.OrderId,
            OrderItemId          = req.OrderItemId,
            CustomerId           = req.CustomerId,
            Quantity             = req.Quantity,
            ReasonForReturn      = req.ReasonForReturn,
            RequestedAction      = req.RequestedAction,
            CustomerComments     = req.CustomerComments,
            ReturnRequestStatus  = ReturnRequestStatus.Pending,
            CreatedOnUtc         = DateTime.UtcNow
        };

        _db.ReturnRequests.Add(returnRequest);
        await _db.SaveChangesAsync(ct);

        return Result<int>.Success(returnRequest.Id);
    }
}

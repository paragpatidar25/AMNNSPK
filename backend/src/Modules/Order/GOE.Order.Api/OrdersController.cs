using GOE.Order.Application.Commands;
using GOE.Order.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GOE.Order.Api;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly CheckoutService _checkout;

    public OrdersController(ISender mediator, CheckoutService checkout)
    {
        _mediator = mediator;
        _checkout = checkout;
    }

    /// <summary>Place a new order (authenticated or guest).</summary>
    [HttpPost("checkout")]
    [AllowAnonymous]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest req, CancellationToken ct)
    {
        var result = await _checkout.CheckoutAsync(req, ct);
        if (!result.Succeeded) return BadRequest(new { error = result.Error });
        return Ok(new { orderId = result.Data });
    }

    /// <summary>Cancel an existing order.</summary>
    [HttpPost("{id:int}/cancel")]
    [Authorize]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelOrderRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CancelOrderCommand(id, req.Reason), ct);
        if (!result.Succeeded) return BadRequest(new { error = result.Error });
        return NoContent();
    }

    /// <summary>Submit a return request (RMA).</summary>
    [HttpPost("{id:int}/return")]
    [Authorize]
    public async Task<IActionResult> Return(int id, [FromBody] ReturnRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new SubmitReturnRequestCommand(
            id, req.OrderItemId, req.CustomerId, req.Quantity,
            req.ReasonForReturn, req.RequestedAction, req.CustomerComments), ct);

        if (!result.Succeeded) return BadRequest(new { error = result.Error });
        return Ok(new { returnRequestId = result.Data });
    }
}

public record CancelOrderRequest(string? Reason);
public record ReturnRequest(int OrderItemId, int CustomerId, int Quantity,
    string ReasonForReturn, string RequestedAction, string? CustomerComments);

using GOE.Identity.Application.Queries;
using GOE.Shared.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GOE.Identity.Api;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly IPermissionService _permissions;

    public CustomersController(ISender mediator, IPermissionService permissions)
    {
        _mediator    = mediator;
        _permissions = permissions;
    }

    [HttpGet]
    [Authorize(Roles = "Administrators,Moderators")]
    public async Task<IActionResult> List([FromQuery] int page = 0, [FromQuery] int size = 20,
        [FromQuery] string? search = null, CancellationToken ct = default)
    {
        await _permissions.DemandAsync(GoePermissions.ManageCustomers, ct);
        var result = await _mediator.Send(new ListCustomersQuery(page, size, search), ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var customer = await _mediator.Send(new GetCustomerByIdQuery(id), ct);
        return customer is null ? NotFound() : Ok(customer);
    }
}

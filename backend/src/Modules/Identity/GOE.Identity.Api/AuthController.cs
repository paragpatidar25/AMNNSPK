using GOE.Identity.Application.Commands;
using GOE.Identity.Application.Services;
using GOE.Identity.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GOE.Identity.Api;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly GoeSignInManager _signInManager;
    private readonly TokenService _tokenService;
    private readonly ICustomerRepository _customerRepo;

    public AuthController(
        ISender mediator,
        GoeSignInManager signInManager,
        TokenService tokenService,
        ICustomerRepository customerRepo)
    {
        _mediator      = mediator;
        _signInManager = signInManager;
        _tokenService  = tokenService;
        _customerRepo  = customerRepo;
    }

    /// <summary>Register a new customer account.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RegisterCustomerCommand(
            req.Email, req.Password, req.FirstName, req.LastName, req.StoreId), ct);

        if (!result.Succeeded)
            return BadRequest(new { error = result.Error });

        return Ok(new { customerId = result.Data });
    }

    /// <summary>Sign in and receive JWT access token.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var ip     = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var result = await _signInManager.PasswordSignInAsync(req.Email, req.Password, ip, ct);

        if (!result.Succeeded)
            return Unauthorized(new { error = result.IsLockedOut ? "Account locked." : "Invalid credentials." });

        var customer = await _customerRepo.GetByEmailAsync(req.Email, ct);
        var token    = _tokenService.GenerateAccessToken(customer!);
        return Ok(new { accessToken = token });
    }
}

public record RegisterRequest(string Email, string Password, string? FirstName, string? LastName, int StoreId = 1);
public record LoginRequest(string Email, string Password);

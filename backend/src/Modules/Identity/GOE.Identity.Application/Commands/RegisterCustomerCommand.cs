using GOE.Identity.Domain.Entities;
using GOE.Identity.Domain.Events;
using GOE.Identity.Domain.Repositories;
using GOE.Shared.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace GOE.Identity.Application.Commands;

public record RegisterCustomerCommand(
    string Email,
    string Password,
    string? FirstName,
    string? LastName,
    int StoreId) : IRequest<Result<int>>;

public class RegisterCustomerCommandHandler : IRequestHandler<RegisterCustomerCommand, Result<int>>
{
    private readonly ICustomerRepository _repo;
    private readonly UserManager<Customer> _userManager;
    private readonly IPublisher _publisher;

    public RegisterCustomerCommandHandler(
        ICustomerRepository repo,
        UserManager<Customer> userManager,
        IPublisher publisher)
    {
        _repo        = repo;
        _userManager = userManager;
        _publisher   = publisher;
    }

    public async Task<Result<int>> Handle(RegisterCustomerCommand req, CancellationToken ct)
    {
        var existing = await _repo.GetByEmailAsync(req.Email, ct);
        if (existing is not null)
            return Result<int>.Failure("A customer with this email already exists.");

        var customer = new Customer
        {
            Email                  = req.Email,
            Username               = req.Email,
            FirstName              = req.FirstName,
            LastName               = req.LastName,
            Active                 = true,
            RegisteredInStoreId    = req.StoreId,
            CreatedOnUtc           = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(customer, req.Password);
        if (!createResult.Succeeded)
            return Result<int>.Failure(string.Join("; ", createResult.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(customer, SystemCustomerRoleNames.Registered);
        await _publisher.Publish(new CustomerRegisteredEvent(customer.Id, customer.Email, DateTime.UtcNow), ct);

        return Result<int>.Success(customer.Id);
    }
}

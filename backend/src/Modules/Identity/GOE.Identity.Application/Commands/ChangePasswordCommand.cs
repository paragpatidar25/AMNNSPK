using GOE.Identity.Domain.Entities;
using GOE.Identity.Domain.Events;
using GOE.Identity.Domain.Repositories;
using GOE.Shared.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace GOE.Identity.Application.Commands;

public record ChangePasswordCommand(int CustomerId, string CurrentPassword, string NewPassword) : IRequest<Result>;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly ICustomerRepository _repo;
    private readonly UserManager<Customer> _userManager;
    private readonly IPublisher _publisher;

    public ChangePasswordCommandHandler(
        ICustomerRepository repo,
        UserManager<Customer> userManager,
        IPublisher publisher)
    {
        _repo        = repo;
        _userManager = userManager;
        _publisher   = publisher;
    }

    public async Task<Result> Handle(ChangePasswordCommand req, CancellationToken ct)
    {
        var customer = await _repo.GetByIdAsync(req.CustomerId, ct);
        if (customer is null) return Result.Failure("Customer not found.");

        var result = await _userManager.ChangePasswordAsync(customer, req.CurrentPassword, req.NewPassword);
        if (!result.Succeeded)
            return Result.Failure(string.Join("; ", result.Errors.Select(e => e.Description)));

        customer.RequireReLogin = true;
        await _repo.UpdateAsync(customer, ct);
        await _publisher.Publish(new PasswordChangedEvent(customer.Id, DateTime.UtcNow), ct);

        return Result.Success();
    }
}

// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: SmartSignInManager — extends ASP.NET Core SignInManager with GOE-specific hooks

using GOE.Identity.Domain.Entities;
using GOE.Identity.Domain.Events;
using GOE.Identity.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace GOE.Identity.Application.Services;

/// <summary>
/// Extends ASP.NET Core's SignInManager with activity logging, lockout policy,
/// external auth merging, and domain event publishing.
/// </summary>
public class GoeSignInManager
{
    private readonly UserManager<Customer> _userManager;
    private readonly ICustomerRepository _customerRepo;
    private readonly IPublisher _publisher;
    private readonly ILogger<GoeSignInManager> _logger;

    public GoeSignInManager(
        UserManager<Customer> userManager,
        ICustomerRepository customerRepo,
        IPublisher publisher,
        ILogger<GoeSignInManager> logger)
    {
        _userManager  = userManager;
        _customerRepo = customerRepo;
        _publisher    = publisher;
        _logger       = logger;
    }

    /// <summary>
    /// Password sign-in with lockout, last-activity update, and event publishing.
    /// </summary>
    public async Task<SignInResult> PasswordSignInAsync(
        string email,
        string password,
        string ipAddress,
        CancellationToken ct = default)
    {
        var customer = await _customerRepo.GetByEmailAsync(email, ct);
        if (customer is null || !customer.Active)
        {
            _logger.LogWarning("Sign-in attempt for unknown/inactive email: {Email}", email);
            return SignInResult.Failed;
        }

        // Check lockout
        if (customer.LockoutEndDateUtc.HasValue && customer.LockoutEndDateUtc > DateTime.UtcNow)
        {
            _logger.LogWarning("Locked-out customer {CustomerId} attempted sign-in", customer.Id);
            return SignInResult.LockedOut;
        }

        var passwordValid = await _userManager.CheckPasswordAsync(customer, password);
        if (!passwordValid)
        {
            customer.FailedLoginAttempts++;
            if (customer.FailedLoginAttempts >= 5)
            {
                customer.LockoutEndDateUtc = DateTime.UtcNow.AddMinutes(15);
                _logger.LogWarning("Customer {CustomerId} locked out after 5 failed attempts", customer.Id);
            }
            await _customerRepo.UpdateAsync(customer, ct);
            return SignInResult.Failed;
        }

        customer.FailedLoginAttempts = 0;
        customer.LockoutEndDateUtc   = null;
        customer.LastLoginDateUtc    = DateTime.UtcNow;
        customer.LastActivityDateUtc = DateTime.UtcNow;
        customer.LastIpAddress       = ipAddress;
        await _customerRepo.UpdateAsync(customer, ct);

        await _publisher.Publish(new CustomerLoggedInEvent(customer.Id, customer.Email, ipAddress, DateTime.UtcNow), ct);

        return SignInResult.Success;
    }

    /// <summary>
    /// Merges or creates a customer from an external OAuth provider.
    /// Pattern: Smartstore IExternalAuthenticationMethod.
    /// </summary>
    public async Task<Customer> ExternalLoginAsync(
        string providerName,
        string externalId,
        string email,
        string? displayName,
        CancellationToken ct = default)
    {
        var existing = await _customerRepo.GetByEmailAsync(email, ct);
        if (existing is not null)
        {
            // Merge external auth record if not already linked
            var alreadyLinked = existing.ExternalAuthRecords
                .Any(r => r.ProviderSystemName == providerName && r.ExternalIdentifier == externalId);
            if (!alreadyLinked)
            {
                existing.ExternalAuthRecords.Add(new ExternalAuthenticationRecord
                {
                    ProviderSystemName      = providerName,
                    ExternalIdentifier      = externalId,
                    ExternalDisplayIdentifier = displayName,
                    Email                   = email,
                    CreatedOnUtc            = DateTime.UtcNow
                });
                await _customerRepo.UpdateAsync(existing, ct);
            }
            return existing;
        }

        // Create new customer from external login
        var newCustomer = new Customer
        {
            Email        = email,
            Username     = email,
            Active       = true,
            CreatedOnUtc = DateTime.UtcNow,
            ExternalAuthRecords = [
                new ExternalAuthenticationRecord
                {
                    ProviderSystemName      = providerName,
                    ExternalIdentifier      = externalId,
                    ExternalDisplayIdentifier = displayName,
                    Email                   = email,
                    CreatedOnUtc            = DateTime.UtcNow
                }
            ]
        };

        var created = await _customerRepo.AddAsync(newCustomer, ct);
        await _publisher.Publish(new CustomerRegisteredEvent(created.Id, created.Email, DateTime.UtcNow), ct);
        return created;
    }
}

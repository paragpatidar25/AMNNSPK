// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore IWorkContext HTTP-request-scoped implementation

using GOE.Identity.Domain.Repositories;
using GOE.Shared.Abstractions;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GOE.Identity.Application.Services;

/// <summary>
/// HTTP-request-scoped implementation of IWorkContext.
/// Resolves current customer from JWT claims and headers.
/// </summary>
public sealed class WorkContext : IWorkContext
{
    private readonly IHttpContextAccessor _http;
    private readonly ICustomerRepository _customerRepo;
    private CustomerContext? _cachedCustomer;

    public WorkContext(IHttpContextAccessor http, ICustomerRepository customerRepo)
    {
        _http         = http;
        _customerRepo = customerRepo;
    }

    public async Task<CustomerContext> GetCurrentCustomerAsync(CancellationToken ct = default)
    {
        if (_cachedCustomer is not null)
            return _cachedCustomer;

        var user = _http.HttpContext?.User;
        var customerIdClaim = user?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (customerIdClaim is not null && int.TryParse(customerIdClaim, out var customerId))
        {
            var customer = await _customerRepo.GetByIdAsync(customerId, ct);
            if (customer is not null)
            {
                var roles = customer.CustomerRoles.Select(r => r.SystemName).ToList();
                _cachedCustomer = new CustomerContext(customer.Id, customer.Email, customer.IsGuest, roles);
                return _cachedCustomer;
            }
        }

        // Return anonymous guest context
        _cachedCustomer = new CustomerContext(0, string.Empty, true, ["Guests"]);
        return _cachedCustomer;
    }

    public string CurrentLanguage =>
        _http.HttpContext?.Request.Headers["Accept-Language"].FirstOrDefault()?.Split(',').First().Trim() ?? "en-US";

    public string CurrentCurrency =>
        _http.HttpContext?.Request.Headers["X-Currency"].FirstOrDefault() ?? "USD";

    public TaxDisplayType TaxDisplayType => TaxDisplayType.IncludingTax;

    public bool IsVendorContext =>
        _http.HttpContext?.User.IsInRole("Vendors") ?? false;
}

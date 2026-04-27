// Ref: https://dev.smartstore.com/framework/platform/identity + https://docs.nopcommerce.com/en/index.html
// Pattern: nopCommerce ACL + Smartstore IPermissionService

using GOE.Identity.Domain.Repositories;
using GOE.Shared.Abstractions;

namespace GOE.Identity.Application.Services;

public class PermissionService : IPermissionService
{
    private readonly IWorkContext _workContext;
    private readonly ICustomerRepository _customerRepo;

    public PermissionService(IWorkContext workContext, ICustomerRepository customerRepo)
    {
        _workContext  = workContext;
        _customerRepo = customerRepo;
    }

    public async Task<bool> AuthorizeAsync(string permissionSystemName, CancellationToken ct = default)
    {
        var ctx = await _workContext.GetCurrentCustomerAsync(ct);
        return await AuthorizeAsync(permissionSystemName, ctx.CustomerId, ct);
    }

    public async Task<bool> AuthorizeAsync(string permissionSystemName, int customerId, CancellationToken ct = default)
    {
        if (customerId <= 0) return false;

        var customer = await _customerRepo.GetByIdAsync(customerId, ct);
        if (customer is null || !customer.Active) return false;

        // Administrators bypass all ACL checks
        if (customer.CustomerRoles.Any(r => r.SystemName == SystemCustomerRoleNames.Administrators))
            return true;

        // Map permission to required role (simplified mapping — extend with DB-driven ACL table)
        var requiredRoles = permissionSystemName switch
        {
            GoePermissions.ManageProducts  => new[] { "Moderators" },
            GoePermissions.ManageOrders    => new[] { "Moderators" },
            GoePermissions.ManageCustomers => new[] { "Moderators" },
            GoePermissions.ManageVendors   => new[] { "Moderators" },
            GoePermissions.PublicStoreAllow => new[] { "Registered", "Guests" },
            _                               => Array.Empty<string>()
        };

        return customer.CustomerRoles.Any(r => requiredRoles.Contains(r.SystemName));
    }

    public async Task DemandAsync(string permissionSystemName, CancellationToken ct = default)
    {
        if (!await AuthorizeAsync(permissionSystemName, ct))
            throw new UnauthorizedAccessException($"Permission denied: {permissionSystemName}");
    }
}

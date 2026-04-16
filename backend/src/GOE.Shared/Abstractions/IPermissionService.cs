// Ref: https://docs.nopcommerce.com/en/index.html + https://dev.smartstore.com/framework/platform/identity
// Pattern: nopCommerce ACL + Smartstore IPermissionService

namespace GOE.Shared.Abstractions;

/// <summary>
/// Evaluates ACL permissions for the current customer.
/// </summary>
public interface IPermissionService
{
    /// <summary>Returns true if the current customer has the specified permission.</summary>
    Task<bool> AuthorizeAsync(string permissionSystemName, CancellationToken ct = default);

    /// <summary>Returns true if a specific customer has the permission.</summary>
    Task<bool> AuthorizeAsync(string permissionSystemName, int customerId, CancellationToken ct = default);

    /// <summary>Throws <see cref="UnauthorizedAccessException"/> when permission is denied.</summary>
    Task DemandAsync(string permissionSystemName, CancellationToken ct = default);
}

/// <summary>Well-known GOE permission system names.</summary>
public static class GoePermissions
{
    public const string ManageProducts   = "Catalog.Products.Manage";
    public const string ManageOrders     = "Orders.Manage";
    public const string ManageCustomers  = "Customers.Manage";
    public const string ManageVendors    = "Vendors.Manage";
    public const string ManagePlugins    = "System.Plugins.Manage";
    public const string ManageSettings   = "System.Settings.Manage";
    public const string PublicStoreAllow = "PublicStore.Allow";
}

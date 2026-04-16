// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore IExternalAuthenticationMethod

using GOE.Shared.Domain;

namespace GOE.Identity.Domain.Entities;

/// <summary>
/// Stores OAuth tokens from external providers (Google, Facebook, etc.)
/// </summary>
public class ExternalAuthenticationRecord : BaseEntity
{
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    /// <summary>Provider name, e.g. "Google", "Facebook".</summary>
    public string ProviderSystemName { get; set; } = string.Empty;

    /// <summary>Subject identifier returned by the provider.</summary>
    public string ExternalIdentifier { get; set; } = string.Empty;

    /// <summary>Display name from provider profile.</summary>
    public string? ExternalDisplayIdentifier { get; set; }

    /// <summary>OAuth access token (encrypted at rest).</summary>
    public string? OAuthToken { get; set; }

    /// <summary>OAuth access token secret (for OAuth 1.0 providers).</summary>
    public string? OAuthAccessTokenSecret { get; set; }

    public string? Email { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
}

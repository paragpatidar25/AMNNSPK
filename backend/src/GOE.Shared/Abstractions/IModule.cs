namespace GOE.Shared.Abstractions;

/// <summary>
/// Contract that every GOE module must implement for registration and teardown.
/// </summary>
public interface IModule
{
    /// <summary>Module system name, e.g. "GOE.Identity".</summary>
    string SystemName { get; }

    /// <summary>Registers module services into the DI container.</summary>
    void Register(IServiceCollection services, IConfiguration configuration);

    /// <summary>Maps module endpoints to the application pipeline.</summary>
    void Map(IEndpointRouteBuilder app);
}

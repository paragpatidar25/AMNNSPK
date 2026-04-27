using GOE.Shared.Abstractions;

namespace GOE.Api;

/// <summary>
/// Discovers and registers all IModule implementations from loaded assemblies.
/// Inspired by Smartstore's modular engine.
/// </summary>
public static class ModuleLoader
{
    /// <summary>
    /// Scans all loaded assemblies for IModule implementations
    /// and calls Register() on each.
    /// </summary>
    public static void RegisterModules(IServiceCollection services, IConfiguration configuration)
    {
        var moduleType = typeof(IModule);
        var modules    = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .Where(t => moduleType.IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
            .Select(Activator.CreateInstance)
            .Cast<IModule>();

        foreach (var module in modules)
        {
            module.Register(services, configuration);
        }
    }

    /// <summary>
    /// Calls Map() on all registered IModule instances to add their endpoint routes.
    /// </summary>
    public static void MapModules(IEndpointRouteBuilder app)
    {
        var modules = app.ServiceProvider
            .GetServices<IModule>();

        foreach (var module in modules)
        {
            module.Map(app);
        }
    }
}

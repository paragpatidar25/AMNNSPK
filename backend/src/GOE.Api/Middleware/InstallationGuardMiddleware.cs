namespace GOE.Api.Middleware;

/// <summary>
/// Redirects all requests to /install if the platform has not been set up yet.
/// Mirrors nopCommerce first-run installation guard.
/// </summary>
public class InstallationGuardMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;

    public InstallationGuardMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env  = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var isInstalled = File.Exists(Path.Combine(_env.ContentRootPath, "App_Data", ".installed"));

        if (!isInstalled && !context.Request.Path.StartsWithSegments("/api/install"))
        {
            context.Response.StatusCode  = StatusCodes.Status503ServiceUnavailable;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error   = "GOE platform is not installed. Please POST to /api/install to complete setup.",
                installUrl = "/api/install"
            });
            return;
        }

        await _next(context);
    }
}

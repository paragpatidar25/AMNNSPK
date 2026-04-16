using GOE.Payment.Domain.Abstractions;

namespace GOE.Api.Middleware;

/// <summary>
/// Routes inbound payment provider webhooks to the correct IPaymentMethod handler.
/// Endpoint: POST /webhooks/{providerSystemName}
/// </summary>
public class WebhookEndpointMiddleware
{
    private readonly RequestDelegate _next;

    public WebhookEndpointMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, IEnumerable<IPaymentMethod> paymentMethods)
    {
        if (!context.Request.Path.StartsWithSegments("/webhooks", out var remaining))
        {
            await _next(context);
            return;
        }

        var providerName = remaining.ToString().TrimStart('/');
        var handler = paymentMethods.FirstOrDefault(p =>
            p.SystemName.Equals(providerName, StringComparison.OrdinalIgnoreCase));

        if (handler is null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        using var reader = new StreamReader(context.Request.Body);
        var rawBody      = await reader.ReadToEndAsync();
        var headers      = context.Request.Headers.ToDictionary(
            h => h.Key, h => h.Value.ToString());

        var payload = new WebhookPayload(providerName, string.Empty, rawBody, headers);
        var result  = await handler.ProcessWebhookAsync(payload);

        context.Response.StatusCode  = result.Processed ? StatusCodes.Status200OK : StatusCodes.Status422UnprocessableEntity;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(result);
    }
}

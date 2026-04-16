// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore Fluid (Liquid-compatible) template engine

using Fluid;

namespace GOE.Notification.Application.Services;

/// <summary>
/// Renders Liquid message templates using the Fluid parser.
/// </summary>
public class LiquidTemplateEngine
{
    private static readonly FluidParser Parser = new();

    /// <summary>Renders a Liquid template string with the provided model.</summary>
    public async Task<string> RenderAsync(string templateSource, object model, CancellationToken ct = default)
    {
        if (!Parser.TryParse(templateSource, out var template, out var error))
            throw new InvalidOperationException($"Liquid template parse error: {error}");

        var context = new TemplateContext(model);
        return await template.RenderAsync(context);
    }

    /// <summary>Renders subject and body for a named template.</summary>
    public async Task<(string Subject, string Body)> RenderTemplateAsync(
        string subjectTemplate,
        string bodyTemplate,
        object model,
        CancellationToken ct = default)
    {
        var subject = await RenderAsync(subjectTemplate, model, ct);
        var body    = await RenderAsync(bodyTemplate, model, ct);
        return (subject, body);
    }
}

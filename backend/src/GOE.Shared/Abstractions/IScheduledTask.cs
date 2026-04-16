namespace GOE.Shared.Abstractions;

/// <summary>
/// Marker interface for Quartz.NET scheduled background tasks.
/// Inspired by Smartstore's scheduled task pattern.
/// </summary>
public interface IScheduledTask
{
    /// <summary>Human-readable task name shown in the admin task list.</summary>
    string Name { get; }

    /// <summary>Cron expression (UTC) for Quartz.NET scheduling.</summary>
    string CronExpression { get; }

    /// <summary>Executes the task.</summary>
    Task ExecuteAsync(CancellationToken ct = default);
}

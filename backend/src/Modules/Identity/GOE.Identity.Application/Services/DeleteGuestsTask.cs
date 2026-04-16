// Ref: https://dev.smartstore.com/framework/platform/identity
// Pattern: Smartstore DeleteGuestsTask — scheduled cleanup of anonymous sessions

using GOE.Identity.Domain.Repositories;
using GOE.Shared.Abstractions;

namespace GOE.Identity.Application.Services;

/// <summary>
/// Quartz.NET task that purges guest customer records older than the configured threshold.
/// Mirrors Smartstore's DeleteGuestsTask.
/// </summary>
public class DeleteGuestsTask : IScheduledTask
{
    private readonly ICustomerRepository _customerRepo;
    private readonly ILogger<DeleteGuestsTask> _logger;

    public string Name => "Delete Guest Customers";
    public string CronExpression => "0 0 2 * * ?"; // 02:00 UTC daily

    public DeleteGuestsTask(ICustomerRepository customerRepo, ILogger<DeleteGuestsTask> logger)
    {
        _customerRepo = customerRepo;
        _logger       = logger;
    }

    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var cutoff   = DateTime.UtcNow.AddDays(-7);
        var guests   = await _customerRepo.GetGuestCustomersAsync(cutoff, ct);
        int deleted  = 0;

        foreach (var guest in guests)
        {
            await _customerRepo.DeleteAsync(guest, ct);
            deleted++;
        }

        _logger.LogInformation("DeleteGuestsTask: removed {Count} guest records older than {Cutoff}", deleted, cutoff);
    }
}

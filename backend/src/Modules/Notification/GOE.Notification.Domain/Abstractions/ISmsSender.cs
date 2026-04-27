namespace GOE.Notification.Domain.Abstractions;

public interface ISmsSender
{
    Task SendAsync(SmsMessage message, CancellationToken ct = default);
}

public record SmsMessage(string To, string Body, string? From = null);

namespace GOE.Notification.Domain.Abstractions;

public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken ct = default);
}

public record EmailMessage(
    string To,
    string Subject,
    string HtmlBody,
    string? From = null,
    string? ReplyTo = null,
    IReadOnlyList<EmailAttachment>? Attachments = null);

public record EmailAttachment(string FileName, byte[] Content, string MimeType);

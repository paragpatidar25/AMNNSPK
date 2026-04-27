using GOE.Shared.Domain;

namespace GOE.Notification.Domain.Entities;

public class QueuedEmail : BaseEntity
{
    public int Priority { get; set; } = 5;
    public string From { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string ToName { get; set; } = string.Empty;
    public string? ReplyTo { get; set; }
    public string? CC { get; set; }
    public string? BCC { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? AttachmentFilePath { get; set; }
    public string? AttachmentFileName { get; set; }
    public int SentTries { get; set; }
    public DateTime? SentOnUtc { get; set; }
    public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;
    public bool DontSendBeforeDateUtc { get; set; }
}

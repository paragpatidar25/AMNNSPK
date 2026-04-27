namespace GOE.Identity.Domain.Events;

public record PasswordChangedEvent(int CustomerId, DateTime OccurredOnUtc);

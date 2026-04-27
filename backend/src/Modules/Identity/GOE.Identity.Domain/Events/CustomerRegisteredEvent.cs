namespace GOE.Identity.Domain.Events;

public record CustomerRegisteredEvent(int CustomerId, string Email, DateTime OccurredOnUtc);

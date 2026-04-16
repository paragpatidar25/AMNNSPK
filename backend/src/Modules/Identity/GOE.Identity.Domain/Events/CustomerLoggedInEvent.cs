namespace GOE.Identity.Domain.Events;

public record CustomerLoggedInEvent(int CustomerId, string Email, string IpAddress, DateTime OccurredOnUtc);

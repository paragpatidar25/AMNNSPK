namespace GOE.Shared.Domain;

/// <summary>
/// Base entity for all GOE domain objects.
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; protected set; }
}

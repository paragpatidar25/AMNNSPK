using GOE.Identity.Domain.Entities;
using GOE.Shared.Results;

namespace GOE.Identity.Domain.Repositories;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Customer?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Customer?> GetByGuidAsync(Guid guid, CancellationToken ct = default);
    Task<PagedResult<Customer>> ListAsync(int pageIndex, int pageSize, string? searchTerm = null, CancellationToken ct = default);
    Task<Customer> AddAsync(Customer customer, CancellationToken ct = default);
    Task UpdateAsync(Customer customer, CancellationToken ct = default);
    Task DeleteAsync(Customer customer, CancellationToken ct = default);
    Task<IReadOnlyList<Customer>> GetGuestCustomersAsync(DateTime olderThan, CancellationToken ct = default);
}

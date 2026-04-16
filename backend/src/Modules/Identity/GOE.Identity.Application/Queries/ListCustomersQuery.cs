using GOE.Identity.Domain.Entities;
using GOE.Identity.Domain.Repositories;
using GOE.Shared.Results;
using MediatR;

namespace GOE.Identity.Application.Queries;

public record ListCustomersQuery(int PageIndex = 0, int PageSize = 20, string? SearchTerm = null)
    : IRequest<PagedResult<Customer>>;

public class ListCustomersQueryHandler : IRequestHandler<ListCustomersQuery, PagedResult<Customer>>
{
    private readonly ICustomerRepository _repo;
    public ListCustomersQueryHandler(ICustomerRepository repo) => _repo = repo;

    public Task<PagedResult<Customer>> Handle(ListCustomersQuery req, CancellationToken ct)
        => _repo.ListAsync(req.PageIndex, req.PageSize, req.SearchTerm, ct);
}

using GOE.Identity.Domain.Entities;
using GOE.Identity.Domain.Repositories;
using MediatR;

namespace GOE.Identity.Application.Queries;

public record GetCustomerByIdQuery(int CustomerId) : IRequest<Customer?>;

public class GetCustomerByIdQueryHandler : IRequestHandler<GetCustomerByIdQuery, Customer?>
{
    private readonly ICustomerRepository _repo;
    public GetCustomerByIdQueryHandler(ICustomerRepository repo) => _repo = repo;

    public Task<Customer?> Handle(GetCustomerByIdQuery req, CancellationToken ct)
        => _repo.GetByIdAsync(req.CustomerId, ct);
}

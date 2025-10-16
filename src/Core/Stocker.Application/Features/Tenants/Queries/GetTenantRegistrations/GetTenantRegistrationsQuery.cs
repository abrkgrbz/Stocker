using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantRegistrations;

public record GetTenantRegistrationsQuery : IRequest<Result<List<TenantRegistrationDto>>>
{
    public string? Status { get; init; }
    public string? SearchTerm { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 100; // Show all pending registrations by default
}

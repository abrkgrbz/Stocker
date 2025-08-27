using MediatR;
using Stocker.Application.DTOs.Company;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Companies.Queries.GetCompany;

public sealed record GetCompanyQuery : IRequest<Result<CompanyDto>>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
}
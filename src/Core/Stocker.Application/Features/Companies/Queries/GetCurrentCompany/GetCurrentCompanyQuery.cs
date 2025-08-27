using MediatR;
using Stocker.Application.DTOs.Company;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Companies.Queries.GetCurrentCompany;

public sealed record GetCurrentCompanyQuery : IRequest<Result<CompanyDto>>
{
    public Guid TenantId { get; set; }
}
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Company;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Companies.Queries.GetCurrentCompany;

public sealed class GetCurrentCompanyQueryHandler : IRequestHandler<GetCurrentCompanyQuery, Result<CompanyDto>>
{
    private readonly ITenantUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetCurrentCompanyQueryHandler> _logger;

    public GetCurrentCompanyQueryHandler(
        ITenantUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetCurrentCompanyQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<CompanyDto>> Handle(GetCurrentCompanyQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var company = await _unitOfWork.Repository<Company>()
                .AsQueryable()
                .FirstOrDefaultAsync(c => c.TenantId == request.TenantId && c.IsActive, cancellationToken);

            if (company == null)
            {
                return Result<CompanyDto>.Failure(
                    Error.NotFound("Company.NotFound", "Şirket bilgisi bulunamadı"));
            }

            var dto = _mapper.Map<CompanyDto>(company);
            return Result<CompanyDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current company for tenant {TenantId}", request.TenantId);
            return Result<CompanyDto>.Failure(
                Error.Failure("Company.GetFailed", "Şirket bilgileri alınırken bir hata oluştu"));
        }
    }
}
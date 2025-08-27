using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Company;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Companies.Commands.CreateCompany;

public sealed class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, Result<CompanyDto>>
{
    private readonly ITenantUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateCompanyCommandHandler> _logger;

    public CreateCompanyCommandHandler(
        ITenantUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<CreateCompanyCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<CompanyDto>> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if company already exists for this tenant
            var existingCompany = await _unitOfWork.Repository<Company>()
                .AsQueryable()
                .FirstOrDefaultAsync(c => c.TenantId == request.TenantId, cancellationToken);

            if (existingCompany != null)
            {
                return Result<CompanyDto>.Failure(
                    Error.Validation("Company.AlreadyExists", "Bu tenant için zaten bir şirket kaydı mevcut"));
            }

            // Create value objects
            var emailResult = Email.Create(request.Email);
            if (emailResult.IsFailure)
            {
                return Result<CompanyDto>.Failure(
                    Error.Validation("Company.InvalidEmail", "Geçersiz email formatı"));
            }

            PhoneNumber? phone = null;
            if (!string.IsNullOrEmpty(request.Phone))
            {
                var phoneResult = PhoneNumber.Create(request.Phone);
                if (phoneResult.IsFailure)
                {
                    return Result<CompanyDto>.Failure(
                        Error.Validation("Company.InvalidPhone", "Geçersiz telefon formatı"));
                }
                phone = phoneResult.Value;
            }

            PhoneNumber? fax = null;
            if (!string.IsNullOrEmpty(request.Fax))
            {
                var faxResult = PhoneNumber.Create(request.Fax);
                if (faxResult.IsFailure)
                {
                    return Result<CompanyDto>.Failure(
                        Error.Validation("Company.InvalidFax", "Geçersiz faks formatı"));
                }
                fax = faxResult.Value;
            }

            var addressResult = CompanyAddress.Create(
                country: request.Address.Country,
                city: request.Address.City,
                district: request.Address.District,
                postalCode: request.Address.PostalCode,
                addressLine: request.Address.AddressLine);
            
            if (addressResult.IsFailure)
            {
                return Result<CompanyDto>.Failure(addressResult.Error);
            }

            // Calculate founded date
            DateTime foundedDate = request.FoundedDate ?? 
                (request.FoundedYear.HasValue 
                    ? new DateTime(request.FoundedYear.Value, 1, 1) 
                    : DateTime.UtcNow);

            // Create company
            var company = Company.Create(
                tenantId: request.TenantId,
                name: request.Name,
                code: request.Code,
                taxNumber: request.TaxNumber ?? string.Empty,
                email: emailResult.Value,
                address: addressResult.Value,
                phone: phone,
                fax: fax,
                identityType: request.IdentityType,
                identityNumber: request.IdentityNumber,
                sector: request.Sector,
                employeeCount: request.EmployeeCount,
                taxOffice: request.TaxOffice,
                tradeRegisterNumber: request.TradeRegisterNumber,
                website: request.Website);

            // Save to database
            await _unitOfWork.Repository<Company>().AddAsync(company, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Company created successfully for tenant {TenantId}", request.TenantId);

            var dto = _mapper.Map<CompanyDto>(company);
            return Result<CompanyDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating company for tenant {TenantId}", request.TenantId);
            return Result<CompanyDto>.Failure(
                Error.Failure("Company.CreateFailed", "Şirket oluşturulurken bir hata oluştu"));
        }
    }
}
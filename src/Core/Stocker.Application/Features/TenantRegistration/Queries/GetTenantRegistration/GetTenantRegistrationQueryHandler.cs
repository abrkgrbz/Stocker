using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetTenantRegistration;

public sealed class GetTenantRegistrationQueryHandler : IRequestHandler<GetTenantRegistrationQuery, Result<TenantRegistrationDto>>
{
    private readonly MasterDbContext _context;

    public GetTenantRegistrationQueryHandler(MasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TenantRegistrationDto>> Handle(GetTenantRegistrationQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TenantRegistrations.AsQueryable();

        if (!string.IsNullOrEmpty(request.RegistrationCode))
            query = query.Where(x => x.RegistrationCode == request.RegistrationCode);
        else if (request.RegistrationId.HasValue)
            query = query.Where(x => x.Id == request.RegistrationId.Value);
        else if (!string.IsNullOrEmpty(request.Email))
        {
            var emailResult = Email.Create(request.Email);
            if (emailResult.IsSuccess)
            {
                var email = emailResult.Value;
                query = query.Where(x => x.ContactEmail == email || x.AdminEmail == email);
            }
        }
        else
            return Result<TenantRegistrationDto>.Failure(Error.Validation("Query.NoParams", "Arama kriteri belirtilmedi."));

        var registration = await query.FirstOrDefaultAsync(cancellationToken);

        if (registration == null)
            return Result<TenantRegistrationDto>.Failure(Error.NotFound("Registration.NotFound", "Kayıt bulunamadı."));

        var dto = new TenantRegistrationDto
        {
            Id = registration.Id,
            RegistrationCode = registration.RegistrationCode,
            CompanyName = registration.CompanyName,
            CompanyCode = registration.CompanyCode,
            Status = registration.Status.ToString(),
            StatusCode = registration.Status,
            ContactEmail = registration.ContactEmail.Value,
            ContactPhone = registration.ContactPhone.Value,
            AdminEmail = registration.AdminEmail.Value,
            AdminName = $"{registration.AdminFirstName} {registration.AdminLastName}",
            RequestedAt = registration.RegistrationDate,
            ApprovedAt = registration.ApprovalDate,
            PackageId = registration.SelectedPackageId,
            PackageName = registration.PackageName,
            BillingCycle = registration.BillingCycle
        };

        return Result<TenantRegistrationDto>.Success(dto);
    }
}
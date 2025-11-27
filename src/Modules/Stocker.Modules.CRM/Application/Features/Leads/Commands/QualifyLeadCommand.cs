using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class QualifyLeadCommand : IRequest<Result<LeadDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public string? Notes { get; set; }
}

public class QualifyLeadCommandValidator : AbstractValidator<QualifyLeadCommand>
{
    public QualifyLeadCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Lead ID is required");
    }
}

public class QualifyLeadCommandHandler : IRequestHandler<QualifyLeadCommand, Result<LeadDto>>
{
    private readonly CRMDbContext _context;

    public QualifyLeadCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LeadDto>> Handle(QualifyLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _context.Leads
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.TenantId == request.TenantId, cancellationToken);

        if (lead == null)
            return Result<LeadDto>.Failure(Error.NotFound("Lead.NotFound", $"Lead with ID {request.Id} not found"));

        var result = lead.UpdateStatus(LeadStatus.Qualified);
        if (result.IsFailure)
            return Result<LeadDto>.Failure(result.Error);

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            lead.UpdateDescription(request.Notes);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new LeadDto
        {
            Id = lead.Id,
            CompanyName = lead.CompanyName,
            FirstName = lead.FirstName,
            LastName = lead.LastName,
            FullName = lead.FullName,
            Email = lead.Email,
            Phone = lead.Phone,
            MobilePhone = lead.MobilePhone,
            JobTitle = lead.JobTitle,
            Industry = lead.Industry,
            Source = lead.Source,
            Status = lead.Status,
            Rating = lead.Rating,
            Address = lead.Address,
            City = lead.City,
            State = lead.State,
            Country = lead.Country,
            PostalCode = lead.PostalCode,
            Website = lead.Website,
            AnnualRevenue = lead.AnnualRevenue,
            NumberOfEmployees = lead.NumberOfEmployees,
            Description = lead.Description,
            AssignedToUserId = lead.AssignedToUserId,
            ConvertedDate = lead.ConvertedDate,
            ConvertedToCustomerId = lead.ConvertedToCustomerId,
            IsConverted = lead.IsConverted,
            Score = lead.Score,
            CreatedAt = lead.CreatedAt,
            UpdatedAt = lead.UpdatedAt
        };

        return Result<LeadDto>.Success(dto);
    }
}

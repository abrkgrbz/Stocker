using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class AssignLeadCommand : IRequest<Result<LeadDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public Guid AssignToUserId { get; set; }
}

public class AssignLeadCommandValidator : AbstractValidator<AssignLeadCommand>
{
    public AssignLeadCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Lead ID is required");

        RuleFor(x => x.AssignToUserId)
            .NotEmpty().WithMessage("User ID is required");
    }
}

public class AssignLeadCommandHandler : IRequestHandler<AssignLeadCommand, Result<LeadDto>>
{
    private readonly CRMDbContext _context;

    public AssignLeadCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LeadDto>> Handle(AssignLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _context.Leads
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.TenantId == request.TenantId, cancellationToken);

        if (lead == null)
            return Result<LeadDto>.Failure(Error.NotFound("Lead.NotFound", $"Lead with ID {request.Id} not found"));

        var result = lead.AssignTo(request.AssignToUserId);
        if (result.IsFailure)
            return Result<LeadDto>.Failure(result.Error);

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

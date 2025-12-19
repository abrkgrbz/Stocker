using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class UpdateLeadScoreCommand : IRequest<Result<LeadDto>>
{
    public Guid Id { get; set; }
    public int Score { get; set; }
    public string? Reason { get; set; }
}

public class UpdateLeadScoreCommandValidator : AbstractValidator<UpdateLeadScoreCommand>
{
    public UpdateLeadScoreCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Lead ID is required");

        RuleFor(x => x.Score)
            .InclusiveBetween(-100, 100).WithMessage("Score adjustment must be between -100 and 100");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class UpdateLeadScoreCommandHandler : IRequestHandler<UpdateLeadScoreCommand, Result<LeadDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateLeadScoreCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeadDto>> Handle(UpdateLeadScoreCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var lead = await _unitOfWork.ReadRepository<Domain.Entities.Lead>().AsQueryable()
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.TenantId == tenantId, cancellationToken);

        if (lead == null)
            return Result<LeadDto>.Failure(Error.NotFound("Lead.NotFound", $"Lead with ID {request.Id} not found"));

        var result = lead.UpdateScore(request.Score);
        if (result.IsFailure)
            return Result<LeadDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

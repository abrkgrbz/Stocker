using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

/// <summary>
/// Command to create a new lead
/// </summary>
public class CreateLeadCommand : IRequest<Result<LeadDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateLeadDto LeadData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateLeadCommand
/// </summary>
public class CreateLeadCommandValidator : AbstractValidator<CreateLeadCommand>
{
    public CreateLeadCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.LeadData)
            .NotNull().WithMessage("Lead data is required");

        When(x => x.LeadData != null, () =>
        {
            RuleFor(x => x.LeadData.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(x => x.LeadData.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

            RuleFor(x => x.LeadData.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

            RuleFor(x => x.LeadData.CompanyName)
                .MaximumLength(200).WithMessage("Company name must not exceed 200 characters");

            RuleFor(x => x.LeadData.Phone)
                .MaximumLength(50).WithMessage("Phone must not exceed 50 characters");

            RuleFor(x => x.LeadData.MobilePhone)
                .MaximumLength(50).WithMessage("Mobile phone must not exceed 50 characters");

            RuleFor(x => x.LeadData.Status)
                .IsInEnum().WithMessage("Invalid lead status");

            RuleFor(x => x.LeadData.Rating)
                .IsInEnum().WithMessage("Invalid lead rating");

            RuleFor(x => x.LeadData.AnnualRevenue)
                .GreaterThanOrEqualTo(0).When(x => x.LeadData.AnnualRevenue.HasValue)
                .WithMessage("Annual revenue cannot be negative");

            RuleFor(x => x.LeadData.NumberOfEmployees)
                .GreaterThanOrEqualTo(0).When(x => x.LeadData.NumberOfEmployees.HasValue)
                .WithMessage("Number of employees cannot be negative");
        });
    }
}

/// <summary>
/// Handler for CreateLeadCommand
/// </summary>
public class CreateLeadCommandHandler : IRequestHandler<CreateLeadCommand, Result<LeadDto>>
{
    private readonly ILeadRepository _leadRepository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateLeadCommandHandler(
        ILeadRepository leadRepository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _leadRepository = leadRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeadDto>> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        // Check if lead with same email already exists
        var emailExists = await _leadRepository.ExistsWithEmailAsync(
            request.LeadData.Email,
            null,
            cancellationToken);

        if (emailExists)
        {
            return Result<LeadDto>.Failure(
                Error.Conflict("Lead.Email", "A lead with this email already exists"));
        }

        // Create the lead
        var leadResult = Lead.Create(
            request.TenantId,
            request.LeadData.FirstName,
            request.LeadData.LastName,
            request.LeadData.Email,
            request.LeadData.CompanyName,
            request.LeadData.Phone,
            request.LeadData.Source,
            request.LeadData.Status,
            request.LeadData.Rating);

        if (leadResult.IsFailure)
        {
            return Result<LeadDto>.Failure(leadResult.Error);
        }

        var lead = leadResult.Value;

        // Update additional information
        if (!string.IsNullOrEmpty(request.LeadData.MobilePhone) ||
            !string.IsNullOrEmpty(request.LeadData.JobTitle) ||
            !string.IsNullOrEmpty(request.LeadData.Industry) ||
            !string.IsNullOrEmpty(request.LeadData.Website) ||
            request.LeadData.AnnualRevenue.HasValue ||
            request.LeadData.NumberOfEmployees.HasValue)
        {
            lead.UpdateBusinessInfo(
                request.LeadData.JobTitle,
                request.LeadData.Industry,
                request.LeadData.Website,
                request.LeadData.AnnualRevenue,
                request.LeadData.NumberOfEmployees);
        }

        if (!string.IsNullOrEmpty(request.LeadData.Address) ||
            !string.IsNullOrEmpty(request.LeadData.City) ||
            !string.IsNullOrEmpty(request.LeadData.State) ||
            !string.IsNullOrEmpty(request.LeadData.Country) ||
            !string.IsNullOrEmpty(request.LeadData.PostalCode))
        {
            lead.UpdateAddress(
                request.LeadData.Address,
                request.LeadData.City,
                request.LeadData.State,
                request.LeadData.Country,
                request.LeadData.PostalCode);
        }

        if (!string.IsNullOrEmpty(request.LeadData.Description))
        {
            lead.UpdateDescription(request.LeadData.Description);
        }

        if (request.LeadData.AssignedToUserId.HasValue)
        {
            lead.AssignTo(request.LeadData.AssignedToUserId.Value);
        }

        // Save to repository
        await _leadRepository.AddAsync(lead, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var leadDto = MapToDto(lead);

        return Result<LeadDto>.Success(leadDto);
    }

    private static LeadDto MapToDto(Lead lead)
    {
        return new LeadDto
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
    }
}
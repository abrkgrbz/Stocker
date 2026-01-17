using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class UpdateCustomerSegmentCommand : IRequest<Result<CustomerSegmentDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = "#1890ff";  // Hex color string
    public Guid ModifiedBy { get; set; }
}

public class UpdateCustomerSegmentCommandValidator : AbstractValidator<UpdateCustomerSegmentCommand>
{
    public UpdateCustomerSegmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Segment name is required")
            .MaximumLength(200).WithMessage("Segment name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Segment color is required")
            .Matches(@"^#[0-9A-Fa-f]{6}$").WithMessage("Color must be a valid hex color (e.g., #1890ff)");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("Modified by user ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class UpdateCustomerSegmentCommandHandler : IRequestHandler<UpdateCustomerSegmentCommand, Result<CustomerSegmentDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateCustomerSegmentCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(UpdateCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var segment = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == tenantId, cancellationToken);

        if (segment == null)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.Id} not found"));
        }

        var result = segment.UpdateDetails(request.Name, request.Description, request.Color, request.ModifiedBy);
        if (result.IsFailure)
        {
            return Result<CustomerSegmentDto>.Failure(result.Error);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new CustomerSegmentDto
        {
            Id = segment.Id,
            TenantId = segment.TenantId,
            Name = segment.Name,
            Description = segment.Description,
            Type = segment.Type,
            Criteria = segment.Criteria,
            Color = segment.Color,
            IsActive = segment.IsActive,
            MemberCount = segment.MemberCount,
            CreatedBy = segment.CreatedBy,
            LastModifiedBy = segment.LastModifiedBy,
            CreatedAt = segment.CreatedAt,
            UpdatedAt = segment.UpdatedAt
        };

        return Result<CustomerSegmentDto>.Success(dto);
    }
}

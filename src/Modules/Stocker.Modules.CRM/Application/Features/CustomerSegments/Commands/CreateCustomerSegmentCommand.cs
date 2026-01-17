using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class CreateCustomerSegmentCommand : IRequest<Result<CustomerSegmentDto>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public SegmentType Type { get; set; }
    public string? Criteria { get; set; }
    public string Color { get; set; } = "#1890ff";  // Hex color string
    public Guid CreatedBy { get; set; }
}

public class CreateCustomerSegmentCommandValidator : AbstractValidator<CreateCustomerSegmentCommand>
{
    public CreateCustomerSegmentCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Segment name is required")
            .MaximumLength(200).WithMessage("Segment name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid segment type");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Segment color is required")
            .Matches(@"^#[0-9A-Fa-f]{6}$").WithMessage("Color must be a valid hex color (e.g., #1890ff)");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("Created by user ID is required");

        RuleFor(x => x.Criteria)
            .NotEmpty().When(x => x.Type == SegmentType.Dynamic)
            .WithMessage("Criteria is required for dynamic segments");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class CreateCustomerSegmentCommandHandler : IRequestHandler<CreateCustomerSegmentCommand, Result<CustomerSegmentDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateCustomerSegmentCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(CreateCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var segment = new Domain.Entities.CustomerSegment(
            tenantId,
            request.Name,
            request.Type,
            request.Color,
            request.CreatedBy,
            request.Description,
            request.Criteria);

        await _unitOfWork.Repository<Domain.Entities.CustomerSegment>().AddAsync(segment, cancellationToken);
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

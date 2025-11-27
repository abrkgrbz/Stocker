using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class CreateCustomerSegmentCommand : IRequest<Result<CustomerSegmentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public SegmentType Type { get; set; }
    public string? Criteria { get; set; }
    public SegmentColor Color { get; set; }
    public Guid CreatedBy { get; set; }
}

public class CreateCustomerSegmentCommandValidator : AbstractValidator<CreateCustomerSegmentCommand>
{
    public CreateCustomerSegmentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Segment name is required")
            .MaximumLength(200).WithMessage("Segment name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid segment type");

        RuleFor(x => x.Color)
            .IsInEnum().WithMessage("Invalid segment color");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("Created by user ID is required");

        RuleFor(x => x.Criteria)
            .NotEmpty().When(x => x.Type == SegmentType.Dynamic)
            .WithMessage("Criteria is required for dynamic segments");
    }
}

public class CreateCustomerSegmentCommandHandler : IRequestHandler<CreateCustomerSegmentCommand, Result<CustomerSegmentDto>>
{
    private readonly CRMDbContext _context;

    public CreateCustomerSegmentCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(CreateCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = new Domain.Entities.CustomerSegment(
            request.TenantId,
            request.Name,
            request.Type,
            request.Color,
            request.CreatedBy,
            request.Description,
            request.Criteria);

        _context.CustomerSegments.Add(segment);
        await _context.SaveChangesAsync(cancellationToken);

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
            LastModifiedBy = segment.LastModifiedBy
        };

        return Result<CustomerSegmentDto>.Success(dto);
    }
}

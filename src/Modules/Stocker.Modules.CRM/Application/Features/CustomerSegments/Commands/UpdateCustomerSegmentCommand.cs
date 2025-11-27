using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class UpdateCustomerSegmentCommand : IRequest<Result<CustomerSegmentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public SegmentColor Color { get; set; }
    public Guid ModifiedBy { get; set; }
}

public class UpdateCustomerSegmentCommandValidator : AbstractValidator<UpdateCustomerSegmentCommand>
{
    public UpdateCustomerSegmentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Segment name is required")
            .MaximumLength(200).WithMessage("Segment name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Color)
            .IsInEnum().WithMessage("Invalid segment color");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("Modified by user ID is required");
    }
}

public class UpdateCustomerSegmentCommandHandler : IRequestHandler<UpdateCustomerSegmentCommand, Result<CustomerSegmentDto>>
{
    private readonly CRMDbContext _context;

    public UpdateCustomerSegmentCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(UpdateCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == request.TenantId, cancellationToken);

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

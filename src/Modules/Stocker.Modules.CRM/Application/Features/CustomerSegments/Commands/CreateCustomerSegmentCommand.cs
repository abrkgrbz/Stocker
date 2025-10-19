using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
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

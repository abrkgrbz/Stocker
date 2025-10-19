using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;

public class AddCustomerTagCommand : IRequest<Result<CustomerTagDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    public string Tag { get; set; } = string.Empty;
    public string? Color { get; set; }
    public Guid CreatedBy { get; set; }
}

public class AddCustomerTagCommandValidator : AbstractValidator<AddCustomerTagCommand>
{
    public AddCustomerTagCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Tag)
            .NotEmpty().WithMessage("Tag is required")
            .MaximumLength(100).WithMessage("Tag cannot exceed 100 characters");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("Created by user ID is required");
    }
}

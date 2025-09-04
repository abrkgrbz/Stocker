using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class CancelActivityCommand : IRequest<Result<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public string? CancelReason { get; set; }
}

public class CancelActivityCommandValidator : AbstractValidator<CancelActivityCommand>
{
    public CancelActivityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Activity ID is required");

        RuleFor(x => x.CancelReason)
            .MaximumLength(500).WithMessage("Cancel reason must not exceed 500 characters");
    }
}
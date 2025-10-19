using FluentValidation;
using MediatR;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;

public class RemoveCustomerTagCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class RemoveCustomerTagCommandValidator : AbstractValidator<RemoveCustomerTagCommand>
{
    public RemoveCustomerTagCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Tag ID is required");
    }
}

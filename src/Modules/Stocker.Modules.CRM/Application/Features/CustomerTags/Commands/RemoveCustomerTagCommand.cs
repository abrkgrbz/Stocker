using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
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

public class RemoveCustomerTagCommandHandler : IRequestHandler<RemoveCustomerTagCommand, Result>
{
    private readonly CRMDbContext _context;

    public RemoveCustomerTagCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(RemoveCustomerTagCommand request, CancellationToken cancellationToken)
    {
        var tag = await _context.CustomerTags
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.TenantId == request.TenantId, cancellationToken);

        if (tag == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerTag.NotFound", $"Tag with ID {request.Id} not found"));
        }

        _context.CustomerTags.Remove(tag);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class DeleteActivityCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class DeleteActivityCommandValidator : AbstractValidator<DeleteActivityCommand>
{
    public DeleteActivityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Activity ID is required");
    }
}

public class DeleteActivityCommandHandler : IRequestHandler<DeleteActivityCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeleteActivityCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == request.TenantId, cancellationToken);

        if (activity == null)
            return Result.Failure(Error.NotFound("Activity.NotFound", $"Activity with ID {request.Id} not found"));

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
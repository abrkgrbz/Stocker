using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class DeleteActivityCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class DeleteActivityCommandValidator : AbstractValidator<DeleteActivityCommand>
{
    public DeleteActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Activity ID is required");
    }
}

/// <summary>
/// Handler for DeleteActivityCommand
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class DeleteActivityCommandHandler : IRequestHandler<DeleteActivityCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteActivityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteActivityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var activity = await _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == tenantId, cancellationToken);

        if (activity == null)
            return Result.Failure(Error.NotFound("Activity.NotFound", $"Activity with ID {request.Id} not found"));

        _unitOfWork.Repository<Activity>().Remove(activity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class ActivateSegmentCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class ActivateSegmentCommandValidator : AbstractValidator<ActivateSegmentCommand>
{
    public ActivateSegmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class ActivateSegmentCommandHandler : IRequestHandler<ActivateSegmentCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public ActivateSegmentCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ActivateSegmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var segment = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == tenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.Id} not found"));
        }

        segment.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

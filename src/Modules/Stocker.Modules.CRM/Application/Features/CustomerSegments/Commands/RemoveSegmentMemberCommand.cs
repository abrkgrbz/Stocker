using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class RemoveSegmentMemberCommand : IRequest<Result>
{
    public Guid SegmentId { get; set; }
    public Guid CustomerId { get; set; }
}

public class RemoveSegmentMemberCommandValidator : AbstractValidator<RemoveSegmentMemberCommand>
{
    public RemoveSegmentMemberCommandValidator()
    {
        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class RemoveSegmentMemberCommandHandler : IRequestHandler<RemoveSegmentMemberCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public RemoveSegmentMemberCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemoveSegmentMemberCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var segment = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == tenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.SegmentId} not found"));
        }

        var result = segment.RemoveMember(request.CustomerId);
        if (result.IsFailure)
        {
            return result;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

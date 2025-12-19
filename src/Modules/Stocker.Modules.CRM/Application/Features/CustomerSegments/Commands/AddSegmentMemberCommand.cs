using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class AddSegmentMemberCommand : IRequest<Result>
{
    public Guid SegmentId { get; set; }
    public Guid CustomerId { get; set; }
    public SegmentMembershipReason Reason { get; set; } = SegmentMembershipReason.Manual;
}

public class AddSegmentMemberCommandValidator : AbstractValidator<AddSegmentMemberCommand>
{
    public AddSegmentMemberCommandValidator()
    {
        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Reason)
            .IsInEnum().WithMessage("Invalid membership reason");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class AddSegmentMemberCommandHandler : IRequestHandler<AddSegmentMemberCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public AddSegmentMemberCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(AddSegmentMemberCommand request, CancellationToken cancellationToken)
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

        // Verify customer exists
        var customerExists = await _unitOfWork.ReadRepository<Domain.Entities.Customer>().AsQueryable()
            .AnyAsync(c => c.Id == request.CustomerId && c.TenantId == tenantId, cancellationToken);

        if (!customerExists)
        {
            return Result.Failure(
                Error.NotFound("Customer.NotFound", $"Customer with ID {request.CustomerId} not found"));
        }

        var result = segment.AddMember(request.CustomerId, request.Reason);
        if (result.IsFailure)
        {
            return result;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

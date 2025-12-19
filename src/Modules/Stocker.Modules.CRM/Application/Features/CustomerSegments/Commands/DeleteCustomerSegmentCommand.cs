using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class DeleteCustomerSegmentCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class DeleteCustomerSegmentCommandValidator : AbstractValidator<DeleteCustomerSegmentCommand>
{
    public DeleteCustomerSegmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class DeleteCustomerSegmentCommandHandler : IRequestHandler<DeleteCustomerSegmentCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteCustomerSegmentCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var segment = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == tenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.Id} not found"));
        }

        // Remove all members first
        foreach (var member in segment.Members)
        {
            _unitOfWork.Repository<Domain.Entities.CustomerSegmentMember>().Remove(member);
        }

        _unitOfWork.Repository<Domain.Entities.CustomerSegment>().Remove(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

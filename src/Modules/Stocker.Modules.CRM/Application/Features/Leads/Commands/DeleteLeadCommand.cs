using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class DeleteLeadCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteLeadCommandValidator : AbstractValidator<DeleteLeadCommand>
{
    public DeleteLeadCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Lead ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class DeleteLeadCommandHandler : IRequestHandler<DeleteLeadCommand, Result<Unit>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteLeadCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(DeleteLeadCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var lead = await _unitOfWork.ReadRepository<Domain.Entities.Lead>().AsQueryable()
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.TenantId == tenantId, cancellationToken);

        if (lead == null)
            return Result<Unit>.Failure(Error.NotFound("Lead.NotFound", $"Lead with ID {request.Id} not found"));

        if (lead.IsConverted)
            return Result<Unit>.Failure(Error.Conflict("Lead.Converted", "Cannot delete a converted lead"));

        // Check for related activities
        var hasActivities = await _unitOfWork.ReadRepository<Domain.Entities.Activity>().AsQueryable()
            .AnyAsync(a => a.LeadId == request.Id && a.TenantId == tenantId, cancellationToken);

        if (hasActivities)
            return Result<Unit>.Failure(Error.Conflict("Lead.HasActivities", "Cannot delete lead with existing activities"));

        _unitOfWork.Repository<Domain.Entities.Lead>().Remove(lead);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}

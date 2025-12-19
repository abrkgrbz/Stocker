using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

public class DeleteOpportunityCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class DeleteOpportunityCommandValidator : AbstractValidator<DeleteOpportunityCommand>
{
    public DeleteOpportunityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class DeleteOpportunityCommandHandler : IRequestHandler<DeleteOpportunityCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteOpportunityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteOpportunityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunity = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (opportunity == null)
            return Result.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.Id} not found"));

        _unitOfWork.Repository<Domain.Entities.Opportunity>().Remove(opportunity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
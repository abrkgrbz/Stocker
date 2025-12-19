using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class DeleteDealCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class DeleteDealCommandValidator : AbstractValidator<DeleteDealCommand>
{
    public DeleteDealCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Deal ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class DeleteDealCommandHandler : IRequestHandler<DeleteDealCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteDealCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteDealCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var deal = await _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == tenantId, cancellationToken);

        if (deal == null)
            return Result.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.Id} not found"));

        deal.Delete();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

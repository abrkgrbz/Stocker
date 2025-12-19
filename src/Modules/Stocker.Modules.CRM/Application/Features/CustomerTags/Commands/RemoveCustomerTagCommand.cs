using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;

public class RemoveCustomerTagCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class RemoveCustomerTagCommandValidator : AbstractValidator<RemoveCustomerTagCommand>
{
    public RemoveCustomerTagCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Tag ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class RemoveCustomerTagCommandHandler : IRequestHandler<RemoveCustomerTagCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public RemoveCustomerTagCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemoveCustomerTagCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var tag = await _unitOfWork.ReadRepository<CustomerTag>().AsQueryable()
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.TenantId == tenantId, cancellationToken);

        if (tag == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerTag.NotFound", $"Tag with ID {request.Id} not found"));
        }

        _unitOfWork.Repository<CustomerTag>().Remove(tag);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

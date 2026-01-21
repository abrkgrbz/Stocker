using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Commands;

/// <summary>
/// Command to activate a reorder rule
/// </summary>
public class ActivateReorderRuleCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for ActivateReorderRuleCommand
/// </summary>
public class ActivateReorderRuleCommandValidator : AbstractValidator<ActivateReorderRuleCommand>
{
    public ActivateReorderRuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kural kimliği gereklidir");
    }
}

/// <summary>
/// Handler for ActivateReorderRuleCommand
/// </summary>
public class ActivateReorderRuleCommandHandler : IRequestHandler<ActivateReorderRuleCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateReorderRuleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ActivateReorderRuleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ReorderRules.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result.Failure(new Error(
                "ReorderRule.NotFound",
                $"Yeniden sipariş kuralı bulunamadı (ID: {request.Id})",
                ErrorType.NotFound));
        }

        entity.Activate();
        _unitOfWork.ReorderRules.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

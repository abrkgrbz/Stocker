using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Commands;

/// <summary>
/// Command to disable a reorder rule
/// </summary>
public class DisableReorderRuleCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for DisableReorderRuleCommand
/// </summary>
public class DisableReorderRuleCommandValidator : AbstractValidator<DisableReorderRuleCommand>
{
    public DisableReorderRuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kural kimliği gereklidir");
    }
}

/// <summary>
/// Handler for DisableReorderRuleCommand
/// </summary>
public class DisableReorderRuleCommandHandler : IRequestHandler<DisableReorderRuleCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DisableReorderRuleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DisableReorderRuleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ReorderRules.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result.Failure(new Error(
                "ReorderRule.NotFound",
                $"Yeniden sipariş kuralı bulunamadı (ID: {request.Id})",
                ErrorType.NotFound));
        }

        entity.Disable();
        _unitOfWork.ReorderRules.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

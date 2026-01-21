using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Commands;

/// <summary>
/// Command to pause a reorder rule
/// </summary>
public class PauseReorderRuleCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for PauseReorderRuleCommand
/// </summary>
public class PauseReorderRuleCommandValidator : AbstractValidator<PauseReorderRuleCommand>
{
    public PauseReorderRuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kural kimliği gereklidir");
    }
}

/// <summary>
/// Handler for PauseReorderRuleCommand
/// </summary>
public class PauseReorderRuleCommandHandler : IRequestHandler<PauseReorderRuleCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public PauseReorderRuleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(PauseReorderRuleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ReorderRules.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result.Failure(new Error(
                "ReorderRule.NotFound",
                $"Yeniden sipariş kuralı bulunamadı (ID: {request.Id})",
                ErrorType.NotFound));
        }

        entity.Pause();
        _unitOfWork.ReorderRules.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

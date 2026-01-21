using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ReorderRules.Commands;

/// <summary>
/// Command to delete a reorder rule
/// </summary>
public class DeleteReorderRuleCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for DeleteReorderRuleCommand
/// </summary>
public class DeleteReorderRuleCommandValidator : AbstractValidator<DeleteReorderRuleCommand>
{
    public DeleteReorderRuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kural kimliği gereklidir");
    }
}

/// <summary>
/// Handler for DeleteReorderRuleCommand
/// </summary>
public class DeleteReorderRuleCommandHandler : IRequestHandler<DeleteReorderRuleCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteReorderRuleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteReorderRuleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ReorderRules.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result.Failure(new Error(
                "ReorderRule.NotFound",
                $"Yeniden sipariş kuralı bulunamadı (ID: {request.Id})",
                ErrorType.NotFound));
        }

        _unitOfWork.ReorderRules.Remove(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

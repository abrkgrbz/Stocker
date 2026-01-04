using MediatR;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.CurrentAccounts.Commands;

/// <summary>
/// Command to delete a current account
/// </summary>
public class DeleteCurrentAccountCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteCurrentAccountCommand
/// </summary>
public class DeleteCurrentAccountCommandHandler : IRequestHandler<DeleteCurrentAccountCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteCurrentAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteCurrentAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Id, cancellationToken);

        if (account == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.Id} ile cari hesap bulunamadı"));
        }

        // Check if account has any transactions
        var hasTransactions = await _unitOfWork.CurrentAccounts.HasTransactionsAsync(request.Id, cancellationToken);
        if (hasTransactions)
        {
            return Result<bool>.Failure(
                Error.Validation("CurrentAccount.HasTransactions", "İşlem geçmişi olan cari hesap silinemez"));
        }

        // Check if account has balance
        if (account.Balance.Amount != 0)
        {
            return Result<bool>.Failure(
                Error.Validation("CurrentAccount.HasBalance", "Bakiyesi olan cari hesap silinemez"));
        }

        _unitOfWork.CurrentAccounts.Remove(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

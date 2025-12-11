using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.DisciplinaryActions.Commands;

/// <summary>
/// Command to delete a disciplinary action
/// </summary>
public record DeleteDisciplinaryActionCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int DisciplinaryActionId { get; init; }
}

/// <summary>
/// Handler for DeleteDisciplinaryActionCommand
/// </summary>
public class DeleteDisciplinaryActionCommandHandler : IRequestHandler<DeleteDisciplinaryActionCommand, Result<int>>
{
    private readonly IDisciplinaryActionRepository _disciplinaryActionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteDisciplinaryActionCommandHandler(
        IDisciplinaryActionRepository disciplinaryActionRepository,
        IUnitOfWork unitOfWork)
    {
        _disciplinaryActionRepository = disciplinaryActionRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(DeleteDisciplinaryActionCommand request, CancellationToken cancellationToken)
    {
        var disciplinaryAction = await _disciplinaryActionRepository.GetByIdAsync(request.DisciplinaryActionId, cancellationToken);
        if (disciplinaryAction == null)
        {
            return Result<int>.Failure(
                Error.NotFound("DisciplinaryAction", $"Disciplinary action with ID {request.DisciplinaryActionId} not found"));
        }

        _disciplinaryActionRepository.Remove(disciplinaryAction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(disciplinaryAction.Id);
    }
}

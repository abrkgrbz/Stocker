using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.DisciplinaryActions.Commands;

/// <summary>
/// Command to delete a disciplinary action
/// </summary>
public record DeleteDisciplinaryActionCommand : IRequest<Result<int>>
{
    public int DisciplinaryActionId { get; init; }
}

/// <summary>
/// Handler for DeleteDisciplinaryActionCommand
/// </summary>
public class DeleteDisciplinaryActionCommandHandler : IRequestHandler<DeleteDisciplinaryActionCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteDisciplinaryActionCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(DeleteDisciplinaryActionCommand request, CancellationToken cancellationToken)
    {
        var disciplinaryAction = await _unitOfWork.DisciplinaryActions.GetByIdAsync(request.DisciplinaryActionId, cancellationToken);
        if (disciplinaryAction == null)
        {
            return Result<int>.Failure(
                Error.NotFound("DisciplinaryAction", $"Disciplinary action with ID {request.DisciplinaryActionId} not found"));
        }

        _unitOfWork.DisciplinaryActions.Remove(disciplinaryAction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(disciplinaryAction.Id);
    }
}

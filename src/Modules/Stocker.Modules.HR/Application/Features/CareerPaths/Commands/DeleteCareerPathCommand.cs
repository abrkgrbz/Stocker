using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.CareerPaths.Commands;

/// <summary>
/// Command to delete a career path
/// </summary>
public record DeleteCareerPathCommand : IRequest<Result<int>>
{
    public int CareerPathId { get; init; }
}

/// <summary>
/// Handler for DeleteCareerPathCommand
/// </summary>
public class DeleteCareerPathCommandHandler : IRequestHandler<DeleteCareerPathCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteCareerPathCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(DeleteCareerPathCommand request, CancellationToken cancellationToken)
    {
        var careerPath = await _unitOfWork.CareerPaths.GetByIdAsync(request.CareerPathId, cancellationToken);
        if (careerPath == null)
        {
            return Result<int>.Failure(
                Error.NotFound("CareerPath", $"Career path with ID {request.CareerPathId} not found"));
        }

        _unitOfWork.CareerPaths.Remove(careerPath);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(careerPath.Id);
    }
}

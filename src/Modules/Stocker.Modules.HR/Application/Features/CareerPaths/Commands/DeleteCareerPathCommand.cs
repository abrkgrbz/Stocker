using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.CareerPaths.Commands;

/// <summary>
/// Command to delete a career path
/// </summary>
public record DeleteCareerPathCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int CareerPathId { get; init; }
}

/// <summary>
/// Handler for DeleteCareerPathCommand
/// </summary>
public class DeleteCareerPathCommandHandler : IRequestHandler<DeleteCareerPathCommand, Result<int>>
{
    private readonly ICareerPathRepository _careerPathRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCareerPathCommandHandler(
        ICareerPathRepository careerPathRepository,
        IUnitOfWork unitOfWork)
    {
        _careerPathRepository = careerPathRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(DeleteCareerPathCommand request, CancellationToken cancellationToken)
    {
        var careerPath = await _careerPathRepository.GetByIdAsync(request.CareerPathId, cancellationToken);
        if (careerPath == null)
        {
            return Result<int>.Failure(
                Error.NotFound("CareerPath", $"Career path with ID {request.CareerPathId} not found"));
        }

        _careerPathRepository.Remove(careerPath);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(careerPath.Id);
    }
}

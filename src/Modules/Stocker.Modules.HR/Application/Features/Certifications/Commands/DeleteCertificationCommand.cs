using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Certifications.Commands;

/// <summary>
/// Command to delete a certification
/// </summary>
public record DeleteCertificationCommand : IRequest<Result<bool>>
{
    public int CertificationId { get; init; }
}

/// <summary>
/// Handler for DeleteCertificationCommand
/// </summary>
public class DeleteCertificationCommandHandler : IRequestHandler<DeleteCertificationCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteCertificationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteCertificationCommand request, CancellationToken cancellationToken)
    {
        var certification = await _unitOfWork.Certifications.GetByIdAsync(request.CertificationId, cancellationToken);
        if (certification == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Certification", $"Certification with ID {request.CertificationId} not found"));
        }

        _unitOfWork.Certifications.Remove(certification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Certifications.Commands;

/// <summary>
/// Command to delete a certification
/// </summary>
public record DeleteCertificationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; init; }
    public int CertificationId { get; init; }
}

/// <summary>
/// Handler for DeleteCertificationCommand
/// </summary>
public class DeleteCertificationCommandHandler : IRequestHandler<DeleteCertificationCommand, Result<bool>>
{
    private readonly ICertificationRepository _certificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCertificationCommandHandler(
        ICertificationRepository certificationRepository,
        IUnitOfWork unitOfWork)
    {
        _certificationRepository = certificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteCertificationCommand request, CancellationToken cancellationToken)
    {
        var certification = await _certificationRepository.GetByIdAsync(request.CertificationId, cancellationToken);
        if (certification == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Certification", $"Certification with ID {request.CertificationId} not found"));
        }

        _certificationRepository.Remove(certification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

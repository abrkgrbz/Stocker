using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Commands;

/// <summary>
/// Command to delete (deactivate) an announcement
/// </summary>
public record DeleteAnnouncementCommand : IRequest<Result<bool>>
{
    public int AnnouncementId { get; init; }
}

/// <summary>
/// Validator for DeleteAnnouncementCommand
/// </summary>
public class DeleteAnnouncementCommandValidator : AbstractValidator<DeleteAnnouncementCommand>
{
    public DeleteAnnouncementCommandValidator()
    {
        RuleFor(x => x.AnnouncementId)
            .GreaterThan(0).WithMessage("Valid announcement ID is required");
    }
}

/// <summary>
/// Handler for DeleteAnnouncementCommand
/// </summary>
public class DeleteAnnouncementCommandHandler : IRequestHandler<DeleteAnnouncementCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteAnnouncementCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _unitOfWork.Announcements.GetByIdAsync(request.AnnouncementId, cancellationToken);
        if (announcement == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Announcement.NotFound", $"Announcement with ID {request.AnnouncementId} not found"));
        }

        announcement.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

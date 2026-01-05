using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Commands;

/// <summary>
/// Command to create a new announcement
/// </summary>
public record CreateAnnouncementCommand : IRequest<Result<AnnouncementDto>>
{
    public int AuthorId { get; init; }
    public CreateAnnouncementDto AnnouncementData { get; init; } = null!;
}

/// <summary>
/// Validator for CreateAnnouncementCommand
/// </summary>
public class CreateAnnouncementCommandValidator : AbstractValidator<CreateAnnouncementCommand>
{
    public CreateAnnouncementCommandValidator()
    {
        RuleFor(x => x.AuthorId)
            .GreaterThan(0).WithMessage("Author ID is required");

        RuleFor(x => x.AnnouncementData)
            .NotNull().WithMessage("Announcement data is required");

        When(x => x.AnnouncementData != null, () =>
        {
            RuleFor(x => x.AnnouncementData.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

            RuleFor(x => x.AnnouncementData.Content)
                .NotEmpty().WithMessage("Content is required");

            RuleFor(x => x.AnnouncementData.AnnouncementType)
                .NotEmpty().WithMessage("Announcement type is required");

            RuleFor(x => x.AnnouncementData.Priority)
                .NotEmpty().WithMessage("Priority is required");
        });
    }
}

/// <summary>
/// Handler for CreateAnnouncementCommand
/// </summary>
public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, Result<AnnouncementDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateAnnouncementCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AnnouncementDto>> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var data = request.AnnouncementData;

        // Parse enum values from string
        if (!Enum.TryParse<AnnouncementType>(data.AnnouncementType, true, out var announcementType))
        {
            announcementType = AnnouncementType.General;
        }

        if (!Enum.TryParse<AnnouncementPriority>(data.Priority, true, out var priority))
        {
            priority = AnnouncementPriority.Normal;
        }

        var announcement = new Announcement(
            data.Title,
            data.Content,
            request.AuthorId,
            announcementType,
            priority,
            data.TargetDepartmentId);

        announcement.SetTenantId(_unitOfWork.TenantId);

        if (data.ExpiryDate.HasValue)
        {
            announcement.SetExpiryDate(data.ExpiryDate);
        }

        if (data.RequiresAcknowledgment)
        {
            announcement.SetRequiresAcknowledgment(true);
        }

        if (data.IsPinned)
        {
            announcement.Pin();
        }

        await _unitOfWork.Announcements.AddAsync(announcement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(announcement);
        return Result<AnnouncementDto>.Success(dto);
    }

    private static AnnouncementDto MapToDto(Announcement announcement)
    {
        return new AnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            AnnouncementType = announcement.Type.ToString(),
            Priority = announcement.Priority.ToString(),
            AuthorId = announcement.AuthorId,
            PublishDate = announcement.PublishDate,
            ExpiryDate = announcement.ExpiryDate,
            IsPublished = announcement.IsPublished,
            IsPinned = announcement.IsPinned,
            RequiresAcknowledgment = announcement.RequiresAcknowledgment,
            TargetDepartmentId = announcement.DepartmentId,
            ViewCount = announcement.ViewCount,
            CreatedAt = announcement.CreatedDate
        };
    }
}

using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Documents.Commands;

/// <summary>
/// Command to upload a file for an existing employee document
/// </summary>
public record UploadEmployeeDocumentCommand : IRequest<Result<EmployeeDocumentDto>>
{
    public int DocumentId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string FileUrl { get; init; } = string.Empty;
    public string? FileType { get; init; }
    public long? FileSizeBytes { get; init; }
}

/// <summary>
/// Validator for UploadEmployeeDocumentCommand
/// </summary>
public class UploadEmployeeDocumentCommandValidator : AbstractValidator<UploadEmployeeDocumentCommand>
{
    public UploadEmployeeDocumentCommandValidator()
    {
        RuleFor(x => x.DocumentId)
            .GreaterThan(0).WithMessage("Document ID must be greater than 0");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required")
            .MaximumLength(255).WithMessage("File name must not exceed 255 characters");

        RuleFor(x => x.FileUrl)
            .NotEmpty().WithMessage("File URL is required")
            .MaximumLength(2000).WithMessage("File URL must not exceed 2000 characters");
    }
}

/// <summary>
/// Handler for UploadEmployeeDocumentCommand
/// </summary>
public class UploadEmployeeDocumentCommandHandler : IRequestHandler<UploadEmployeeDocumentCommand, Result<EmployeeDocumentDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UploadEmployeeDocumentCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDocumentDto>> Handle(UploadEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _unitOfWork.EmployeeDocuments.GetByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
        {
            return Result<EmployeeDocumentDto>.Failure(
                Error.NotFound("Document", $"Document with ID {request.DocumentId} not found"));
        }

        document.UpdateFile(
            request.FileName,
            request.FileUrl,
            request.FileType,
            request.FileSizeBytes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new EmployeeDocumentDto
        {
            Id = document.Id,
            EmployeeId = document.EmployeeId,
            DocumentType = document.DocumentType,
            Title = document.Title,
            Description = document.Description,
            FileName = document.FileName,
            FileUrl = document.FileUrl,
            FileType = document.FileType,
            FileSize = document.FileSizeBytes,
            IssueDate = document.IssueDate,
            ExpiryDate = document.ExpiryDate,
            IssuingAuthority = document.IssuingAuthority,
            DocumentNumber = document.DocumentNumber ?? string.Empty,
            IsVerified = document.IsVerified,
            VerifiedById = document.VerifiedById,
            VerifiedDate = document.VerifiedDate,
            Notes = document.Notes,
            CreatedAt = document.CreatedDate
        };

        return Result<EmployeeDocumentDto>.Success(dto);
    }
}

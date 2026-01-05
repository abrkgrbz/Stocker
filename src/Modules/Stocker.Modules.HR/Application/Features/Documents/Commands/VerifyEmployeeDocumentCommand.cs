using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Documents.Commands;

/// <summary>
/// Command to verify an employee document
/// </summary>
public record VerifyEmployeeDocumentCommand : IRequest<Result<EmployeeDocumentDto>>
{
    public int DocumentId { get; init; }
    public int VerifiedById { get; init; }
    public VerifyDocumentDto VerificationData { get; init; } = null!;
}

/// <summary>
/// Validator for VerifyEmployeeDocumentCommand
/// </summary>
public class VerifyEmployeeDocumentCommandValidator : AbstractValidator<VerifyEmployeeDocumentCommand>
{
    public VerifyEmployeeDocumentCommandValidator()
    {
        RuleFor(x => x.DocumentId)
            .GreaterThan(0).WithMessage("Valid document ID is required");

        RuleFor(x => x.VerifiedById)
            .GreaterThan(0).WithMessage("Valid verifier ID is required");

        RuleFor(x => x.VerificationData)
            .NotNull().WithMessage("Verification data is required");

        When(x => x.VerificationData != null, () =>
        {
            RuleFor(x => x.VerificationData.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for VerifyEmployeeDocumentCommand
/// </summary>
public class VerifyEmployeeDocumentCommandHandler : IRequestHandler<VerifyEmployeeDocumentCommand, Result<EmployeeDocumentDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public VerifyEmployeeDocumentCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDocumentDto>> Handle(VerifyEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _unitOfWork.EmployeeDocuments.GetByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
        {
            return Result<EmployeeDocumentDto>.Failure(
                Error.NotFound("Document.NotFound", $"Document with ID {request.DocumentId} not found"));
        }

        if (document.IsVerified)
        {
            return Result<EmployeeDocumentDto>.Failure(
                Error.Conflict("Document.AlreadyVerified", "Document is already verified"));
        }

        document.Verify(request.VerifiedById);

        if (request.VerificationData?.Notes != null)
        {
            document.SetNotes(request.VerificationData.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new EmployeeDocumentDto
        {
            Id = document.Id,
            EmployeeId = document.EmployeeId,
            DocumentType = document.DocumentType,
            DocumentNumber = document.DocumentNumber ?? string.Empty,
            Title = document.Title,
            Description = document.Description,
            FileUrl = document.FileUrl,
            FileName = document.FileName,
            FileType = document.FileType,
            FileSize = document.FileSizeBytes,
            IssueDate = document.IssueDate,
            ExpiryDate = document.ExpiryDate,
            IssuingAuthority = document.IssuingAuthority,
            IsVerified = document.IsVerified,
            VerifiedById = document.VerifiedById,
            VerifiedDate = document.VerifiedDate,
            Notes = document.Notes,
            CreatedAt = document.CreatedDate
        };

        return Result<EmployeeDocumentDto>.Success(dto);
    }
}

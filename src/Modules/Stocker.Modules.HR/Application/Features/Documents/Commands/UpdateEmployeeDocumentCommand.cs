using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Documents.Commands;

/// <summary>
/// Command to update an existing employee document
/// </summary>
public record UpdateEmployeeDocumentCommand : IRequest<Result<EmployeeDocumentDto>>
{
    public int DocumentId { get; init; }
    public UpdateEmployeeDocumentDto DocumentData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdateEmployeeDocumentCommand
/// </summary>
public class UpdateEmployeeDocumentCommandValidator : AbstractValidator<UpdateEmployeeDocumentCommand>
{
    public UpdateEmployeeDocumentCommandValidator()
    {
        RuleFor(x => x.DocumentId)
            .GreaterThan(0).WithMessage("Valid document ID is required");

        RuleFor(x => x.DocumentData)
            .NotNull().WithMessage("Document data is required");

        When(x => x.DocumentData != null, () =>
        {
            RuleFor(x => x.DocumentData.Title)
                .NotEmpty().WithMessage("Document title is required")
                .MaximumLength(200).WithMessage("Document title must not exceed 200 characters");

            RuleFor(x => x.DocumentData.DocumentNumber)
                .NotEmpty().WithMessage("Document number is required")
                .MaximumLength(100).WithMessage("Document number must not exceed 100 characters");

            RuleFor(x => x.DocumentData.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for UpdateEmployeeDocumentCommand
/// </summary>
public class UpdateEmployeeDocumentCommandHandler : IRequestHandler<UpdateEmployeeDocumentCommand, Result<EmployeeDocumentDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateEmployeeDocumentCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDocumentDto>> Handle(UpdateEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _unitOfWork.EmployeeDocuments.GetByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
        {
            return Result<EmployeeDocumentDto>.Failure(
                Error.NotFound("Document.NotFound", $"Document with ID {request.DocumentId} not found"));
        }

        var data = request.DocumentData;

        document.Update(
            data.Title,
            data.Description,
            data.IssueDate,
            data.ExpiryDate,
            data.IssuingAuthority,
            data.DocumentNumber);

        if (data.Notes != null)
        {
            document.SetNotes(data.Notes);
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

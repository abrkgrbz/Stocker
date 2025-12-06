using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Documents.Commands;

/// <summary>
/// Command to create a new employee document
/// </summary>
public class CreateEmployeeDocumentCommand : IRequest<Result<EmployeeDocumentDto>>
{
    public Guid TenantId { get; set; }
    public CreateEmployeeDocumentDto DocumentData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateEmployeeDocumentCommand
/// </summary>
public class CreateEmployeeDocumentCommandValidator : AbstractValidator<CreateEmployeeDocumentCommand>
{
    public CreateEmployeeDocumentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DocumentData)
            .NotNull().WithMessage("Document data is required");

        When(x => x.DocumentData != null, () =>
        {
            RuleFor(x => x.DocumentData.EmployeeId)
                .GreaterThan(0).WithMessage("Valid employee ID is required");

            RuleFor(x => x.DocumentData.DocumentType)
                .IsInEnum().WithMessage("Invalid document type");

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
/// Handler for CreateEmployeeDocumentCommand
/// </summary>
public class CreateEmployeeDocumentCommandHandler : IRequestHandler<CreateEmployeeDocumentCommand, Result<EmployeeDocumentDto>>
{
    private readonly IEmployeeDocumentRepository _documentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateEmployeeDocumentCommandHandler(
        IEmployeeDocumentRepository documentRepository,
        IUnitOfWork unitOfWork)
    {
        _documentRepository = documentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDocumentDto>> Handle(CreateEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var data = request.DocumentData;

        // Create a basic document with minimal required fields
        var document = new EmployeeDocument(
            data.EmployeeId,
            data.DocumentType,
            data.Title,
            string.Empty, // fileName - will be set later if file is uploaded
            string.Empty); // fileUrl - will be set later if file is uploaded

        document.SetTenantId(request.TenantId);

        // Update with additional fields
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

        await _documentRepository.AddAsync(document, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(document);
        return Result<EmployeeDocumentDto>.Success(dto);
    }

    private static EmployeeDocumentDto MapToDto(EmployeeDocument document)
    {
        return new EmployeeDocumentDto
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
    }
}

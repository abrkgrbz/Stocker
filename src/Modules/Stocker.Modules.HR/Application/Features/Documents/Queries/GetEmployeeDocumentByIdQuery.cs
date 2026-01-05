using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Documents.Queries;

/// <summary>
/// Query to get an employee document by ID
/// </summary>
public record GetEmployeeDocumentByIdQuery(int DocumentId) : IRequest<Result<EmployeeDocumentDto>>;

/// <summary>
/// Validator for GetEmployeeDocumentByIdQuery
/// </summary>
public class GetEmployeeDocumentByIdQueryValidator : AbstractValidator<GetEmployeeDocumentByIdQuery>
{
    public GetEmployeeDocumentByIdQueryValidator()
    {
        RuleFor(x => x.DocumentId)
            .GreaterThan(0).WithMessage("Document ID is required");
    }
}

/// <summary>
/// Handler for GetEmployeeDocumentByIdQuery
/// </summary>
public class GetEmployeeDocumentByIdQueryHandler : IRequestHandler<GetEmployeeDocumentByIdQuery, Result<EmployeeDocumentDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeDocumentByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDocumentDto>> Handle(GetEmployeeDocumentByIdQuery request, CancellationToken cancellationToken)
    {
        var document = await _unitOfWork.EmployeeDocuments.GetByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
        {
            return Result<EmployeeDocumentDto>.Failure(
                Error.NotFound("Document.NotFound", $"Document with ID {request.DocumentId} not found"));
        }

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

using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Documents.Queries;

/// <summary>
/// Query to get employee documents with optional filtering
/// </summary>
public record GetEmployeeDocumentsQuery : IRequest<Result<List<EmployeeDocumentDto>>>
{
    public int? EmployeeId { get; init; }
    public DocumentType? DocumentType { get; init; }
    public bool? IsVerified { get; init; }
    public bool? IsExpired { get; init; }
    public bool IncludeInactive { get; init; }
}

/// <summary>
/// Handler for GetEmployeeDocumentsQuery
/// </summary>
public class GetEmployeeDocumentsQueryHandler : IRequestHandler<GetEmployeeDocumentsQuery, Result<List<EmployeeDocumentDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeDocumentsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<EmployeeDocumentDto>>> Handle(GetEmployeeDocumentsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Domain.Entities.EmployeeDocument> documents;

        if (request.EmployeeId.HasValue)
        {
            documents = await _unitOfWork.EmployeeDocuments.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else
        {
            documents = await _unitOfWork.EmployeeDocuments.GetAllAsync(cancellationToken);
        }

        var filtered = documents.AsEnumerable();

        if (request.DocumentType.HasValue)
        {
            filtered = filtered.Where(d => d.DocumentType == request.DocumentType.Value);
        }

        if (request.IsVerified.HasValue)
        {
            filtered = filtered.Where(d => d.IsVerified == request.IsVerified.Value);
        }

        if (request.IsExpired.HasValue)
        {
            var now = DateTime.UtcNow;
            filtered = request.IsExpired.Value
                ? filtered.Where(d => d.ExpiryDate.HasValue && d.ExpiryDate.Value < now)
                : filtered.Where(d => !d.ExpiryDate.HasValue || d.ExpiryDate.Value >= now);
        }

        if (!request.IncludeInactive)
        {
            filtered = filtered.Where(d => d.IsActive);
        }

        var dtos = filtered.Select(d => new EmployeeDocumentDto
        {
            Id = d.Id,
            EmployeeId = d.EmployeeId,
            DocumentType = d.DocumentType,
            DocumentNumber = d.DocumentNumber ?? string.Empty,
            Title = d.Title,
            Description = d.Description,
            FileUrl = d.FileUrl,
            FileName = d.FileName,
            FileType = d.FileType,
            FileSize = d.FileSizeBytes,
            IssueDate = d.IssueDate,
            ExpiryDate = d.ExpiryDate,
            IssuingAuthority = d.IssuingAuthority,
            IsVerified = d.IsVerified,
            VerifiedById = d.VerifiedById,
            VerifiedDate = d.VerifiedDate,
            Notes = d.Notes,
            CreatedAt = d.CreatedDate
        }).OrderByDescending(d => d.CreatedAt).ToList();

        return Result<List<EmployeeDocumentDto>>.Success(dtos);
    }
}

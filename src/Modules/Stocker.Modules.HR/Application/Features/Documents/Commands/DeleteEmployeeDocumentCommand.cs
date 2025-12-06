using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Documents.Commands;

/// <summary>
/// Command to delete (deactivate) an employee document
/// </summary>
public class DeleteEmployeeDocumentCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int DocumentId { get; set; }
}

/// <summary>
/// Validator for DeleteEmployeeDocumentCommand
/// </summary>
public class DeleteEmployeeDocumentCommandValidator : AbstractValidator<DeleteEmployeeDocumentCommand>
{
    public DeleteEmployeeDocumentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DocumentId)
            .GreaterThan(0).WithMessage("Valid document ID is required");
    }
}

/// <summary>
/// Handler for DeleteEmployeeDocumentCommand
/// </summary>
public class DeleteEmployeeDocumentCommandHandler : IRequestHandler<DeleteEmployeeDocumentCommand, Result<bool>>
{
    private readonly IEmployeeDocumentRepository _documentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteEmployeeDocumentCommandHandler(
        IEmployeeDocumentRepository documentRepository,
        IUnitOfWork unitOfWork)
    {
        _documentRepository = documentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _documentRepository.GetByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Document.NotFound", $"Document with ID {request.DocumentId} not found"));
        }

        document.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Commands;

/// <summary>
/// Command to delete (deactivate) a leave type
/// </summary>
public class DeleteLeaveTypeCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int LeaveTypeId { get; set; }
}

/// <summary>
/// Validator for DeleteLeaveTypeCommand
/// </summary>
public class DeleteLeaveTypeCommandValidator : AbstractValidator<DeleteLeaveTypeCommand>
{
    public DeleteLeaveTypeCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.LeaveTypeId)
            .GreaterThan(0).WithMessage("Valid leave type ID is required");
    }
}

/// <summary>
/// Handler for DeleteLeaveTypeCommand
/// </summary>
public class DeleteLeaveTypeCommandHandler : IRequestHandler<DeleteLeaveTypeCommand, Result<bool>>
{
    private readonly ILeaveTypeRepository _leaveTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteLeaveTypeCommandHandler(
        ILeaveTypeRepository leaveTypeRepository,
        IUnitOfWork unitOfWork)
    {
        _leaveTypeRepository = leaveTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteLeaveTypeCommand request, CancellationToken cancellationToken)
    {
        var leaveType = await _leaveTypeRepository.GetByIdAsync(request.LeaveTypeId, cancellationToken);
        if (leaveType == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("LeaveType.NotFound", $"Leave type with ID {request.LeaveTypeId} not found"));
        }

        leaveType.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

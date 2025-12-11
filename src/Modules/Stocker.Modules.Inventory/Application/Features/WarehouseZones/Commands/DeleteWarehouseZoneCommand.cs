using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.WarehouseZones.Commands;

/// <summary>
/// Command to delete a warehouse zone
/// </summary>
public class DeleteWarehouseZoneCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for DeleteWarehouseZoneCommand
/// </summary>
public class DeleteWarehouseZoneCommandValidator : AbstractValidator<DeleteWarehouseZoneCommand>
{
    public DeleteWarehouseZoneCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteWarehouseZoneCommand
/// </summary>
public class DeleteWarehouseZoneCommandHandler : IRequestHandler<DeleteWarehouseZoneCommand, Result<bool>>
{
    private readonly IWarehouseZoneRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteWarehouseZoneCommandHandler(IWarehouseZoneRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteWarehouseZoneCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("WarehouseZone.NotFound", $"Warehouse zone with ID {request.Id} not found", ErrorType.NotFound));
        }

        // Check if zone has locations
        if (entity.Locations != null && entity.Locations.Count > 0)
        {
            return Result<bool>.Failure(new Error("WarehouseZone.HasLocations", "Cannot delete zone with associated locations", ErrorType.Validation));
        }

        entity.Delete("system");
        await _repository.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

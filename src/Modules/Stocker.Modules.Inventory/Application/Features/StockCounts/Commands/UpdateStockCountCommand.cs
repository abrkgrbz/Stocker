using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

/// <summary>
/// Command to update a stock count
/// </summary>
public class UpdateStockCountCommand : IRequest<Result<StockCountDto>>
{
    public Guid TenantId { get; set; }
    public int StockCountId { get; set; }
    public UpdateStockCountDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateStockCountCommand
/// </summary>
public class UpdateStockCountCommandValidator : AbstractValidator<UpdateStockCountCommand>
{
    public UpdateStockCountCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.StockCountId)
            .NotEmpty().WithMessage("Stock count ID is required");

        RuleFor(x => x.Data)
            .NotNull().WithMessage("Update data is required");

        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(x => x.Data.Notes)
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");
        });
    }
}

/// <summary>
/// Handler for UpdateStockCountCommand
/// </summary>
public class UpdateStockCountCommandHandler : IRequestHandler<UpdateStockCountCommand, Result<StockCountDto>>
{
    private readonly IStockCountRepository _stockCountRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateStockCountCommandHandler(
        IStockCountRepository stockCountRepository,
        IUnitOfWork unitOfWork)
    {
        _stockCountRepository = stockCountRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockCountDto>> Handle(UpdateStockCountCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _stockCountRepository.GetWithItemsAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<StockCountDto>.Failure(
                Error.NotFound("StockCount", $"Stock count with ID {request.StockCountId} not found"));
        }

        // Can only update draft or in-progress counts
        if (stockCount.Status != Domain.Enums.StockCountStatus.Draft &&
            stockCount.Status != Domain.Enums.StockCountStatus.InProgress)
        {
            return Result<StockCountDto>.Failure(
                Error.Validation("StockCount.NotEditable", "Can only update draft or in-progress counts"));
        }

        // Update fields
        if (request.Data.Description != null)
        {
            stockCount.SetDescription(request.Data.Description);
        }

        if (request.Data.Notes != null)
        {
            stockCount.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = new StockCountDto
        {
            Id = stockCount.Id,
            CountNumber = stockCount.CountNumber,
            CountDate = stockCount.CountDate,
            WarehouseId = stockCount.WarehouseId,
            WarehouseName = stockCount.Warehouse?.Name ?? string.Empty,
            LocationId = stockCount.LocationId,
            LocationName = stockCount.Location?.Name,
            Status = stockCount.Status,
            CountType = stockCount.CountType,
            Description = stockCount.Description,
            Notes = stockCount.Notes,
            AutoAdjust = stockCount.AutoAdjust,
            StartedDate = stockCount.StartedAt,
            CompletedDate = stockCount.CompletedAt,
            CancelledDate = stockCount.CancelledAt,
            CancellationReason = stockCount.CancellationReason,
            CreatedByUserId = stockCount.CreatedByUserId,
            CompletedByUserId = stockCount.CountedByUserId,
            CreatedAt = stockCount.CreatedDate,
            TotalItems = stockCount.Items.Count,
            CountedItems = stockCount.Items.Count(i => i.IsCounted),
            ItemsWithDifferenceCount = stockCount.GetItemsWithDifferenceCount(),
            TotalSystemQuantity = stockCount.GetTotalSystemQuantity(),
            TotalCountedQuantity = stockCount.GetTotalCountedQuantity(),
            TotalDifference = stockCount.GetTotalDifference(),
            Items = stockCount.Items.Select(item => new StockCountItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductCode = item.Product?.Code ?? string.Empty,
                ProductName = item.Product?.Name ?? string.Empty,
                LocationId = item.LocationId,
                LocationName = item.Location?.Name,
                SystemQuantity = item.SystemQuantity,
                CountedQuantity = item.CountedQuantity,
                Difference = item.Difference,
                HasDifference = item.HasDifference,
                SerialNumber = item.SerialNumber,
                LotNumber = item.LotNumber,
                Notes = item.Notes,
                IsCounted = item.IsCounted
            }).ToList()
        };

        return Result<StockCountDto>.Success(dto);
    }
}

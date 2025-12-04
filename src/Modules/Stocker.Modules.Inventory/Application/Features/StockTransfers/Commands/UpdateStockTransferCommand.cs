using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

/// <summary>
/// Command to update a stock transfer
/// </summary>
public class UpdateStockTransferCommand : IRequest<Result<StockTransferDto>>
{
    public Guid TenantId { get; set; }
    public int TransferId { get; set; }
    public UpdateStockTransferDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateStockTransferCommand
/// </summary>
public class UpdateStockTransferCommandValidator : AbstractValidator<UpdateStockTransferCommand>
{
    public UpdateStockTransferCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.TransferId)
            .NotEmpty().WithMessage("Transfer ID is required");

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
/// Handler for UpdateStockTransferCommand
/// </summary>
public class UpdateStockTransferCommandHandler : IRequestHandler<UpdateStockTransferCommand, Result<StockTransferDto>>
{
    private readonly IStockTransferRepository _stockTransferRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateStockTransferCommandHandler(
        IStockTransferRepository stockTransferRepository,
        IUnitOfWork unitOfWork)
    {
        _stockTransferRepository = stockTransferRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockTransferDto>> Handle(UpdateStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _stockTransferRepository.GetWithItemsAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<StockTransferDto>.Failure(
                Error.NotFound("StockTransfer", $"Stock transfer with ID {request.TransferId} not found"));
        }

        // Can only update draft transfers
        if (transfer.Status != Domain.Enums.TransferStatus.Draft)
        {
            return Result<StockTransferDto>.Failure(
                Error.Validation("StockTransfer.NotDraft", "Can only update draft transfers"));
        }

        // Update fields
        if (request.Data.Description != null)
        {
            transfer.SetDescription(request.Data.Description);
        }

        if (request.Data.Notes != null)
        {
            transfer.SetNotes(request.Data.Notes);
        }

        if (request.Data.ExpectedArrivalDate.HasValue)
        {
            transfer.SetExpectedArrival(request.Data.ExpectedArrivalDate);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = new StockTransferDto
        {
            Id = transfer.Id,
            TransferNumber = transfer.TransferNumber,
            TransferDate = transfer.TransferDate,
            SourceWarehouseId = transfer.SourceWarehouseId,
            SourceWarehouseName = transfer.SourceWarehouse?.Name ?? string.Empty,
            DestinationWarehouseId = transfer.DestinationWarehouseId,
            DestinationWarehouseName = transfer.DestinationWarehouse?.Name ?? string.Empty,
            Status = transfer.Status,
            TransferType = transfer.TransferType,
            Description = transfer.Description,
            Notes = transfer.Notes,
            ExpectedArrivalDate = transfer.ExpectedArrivalDate,
            ShippedDate = transfer.ShippedDate,
            ReceivedDate = transfer.ReceivedDate,
            CompletedDate = transfer.CompletedDate,
            CancelledDate = transfer.CancelledDate,
            CancellationReason = transfer.CancellationReason,
            CreatedByUserId = transfer.CreatedByUserId,
            ApprovedByUserId = transfer.ApprovedByUserId,
            ShippedByUserId = transfer.ShippedByUserId,
            ReceivedByUserId = transfer.ReceivedByUserId,
            CreatedAt = transfer.CreatedDate,
            TotalRequestedQuantity = transfer.GetTotalRequestedQuantity(),
            TotalShippedQuantity = transfer.GetTotalShippedQuantity(),
            TotalReceivedQuantity = transfer.GetTotalReceivedQuantity(),
            Items = transfer.Items.Select(item => new StockTransferItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductCode = item.Product?.Code ?? string.Empty,
                ProductName = item.Product?.Name ?? string.Empty,
                SourceLocationId = item.SourceLocationId,
                SourceLocationName = item.SourceLocation?.Name,
                DestinationLocationId = item.DestinationLocationId,
                DestinationLocationName = item.DestinationLocation?.Name,
                RequestedQuantity = item.RequestedQuantity,
                ShippedQuantity = item.ShippedQuantity,
                ReceivedQuantity = item.ReceivedQuantity,
                DamagedQuantity = item.DamagedQuantity,
                SerialNumber = item.SerialNumber,
                LotNumber = item.LotNumber,
                Notes = item.Notes
            }).ToList()
        };

        return Result<StockTransferDto>.Success(dto);
    }
}

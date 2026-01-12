using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CostAccounting.Commands;

public record CreateStandardCostCardCommand(CreateStandardCostCardRequest Request) : IRequest<StandardCostCardDto>;

public class CreateStandardCostCardCommandHandler : IRequestHandler<CreateStandardCostCardCommand, StandardCostCardDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateStandardCostCardCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<StandardCostCardDto> Handle(CreateStandardCostCardCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        // Get next version for this product and year
        var existingCards = await _unitOfWork.StandardCostCards.GetByProductAsync(request.ProductId, cancellationToken);
        var yearCards = existingCards.Where(c => c.Year == request.Year && c.TenantId == tenantId).ToList();
        var nextVersion = yearCards.Any() ? yearCards.Max(c => c.Version) + 1 : 1;

        var card = new StandardCostCard(request.ProductId, request.Year, nextVersion);
        card.SetProductInfo(request.ProductCode, request.ProductName);
        card.SetStandardCosts(request.StandardMaterialCost, request.StandardLaborCost, request.StandardOverheadCost);
        card.SetStandardUsages(request.StandardMaterialQuantity, request.StandardLaborHours, request.StandardMachineHours);
        card.SetRates(request.MaterialUnitPrice, request.LaborHourlyRate, request.OverheadRate);
        card.SetEffectivePeriod(request.EffectiveDate, request.ExpiryDate);

        if (!string.IsNullOrEmpty(request.Notes))
            card.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(userName))
            card.SetCreatedBy(userName);

        _unitOfWork.StandardCostCards.Add(card);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(card);
    }

    private static StandardCostCardDto MapToDto(StandardCostCard entity) => new(
        entity.Id,
        entity.ProductId,
        entity.ProductCode,
        entity.ProductName,
        entity.Year,
        entity.Version,
        entity.IsCurrent,
        entity.StandardMaterialCost,
        entity.StandardLaborCost,
        entity.StandardOverheadCost,
        entity.StandardTotalCost,
        entity.StandardMaterialQuantity,
        entity.StandardLaborHours,
        entity.StandardMachineHours,
        entity.MaterialUnitPrice,
        entity.LaborHourlyRate,
        entity.OverheadRate,
        entity.EffectiveDate,
        entity.ExpiryDate,
        entity.Notes,
        entity.CreatedBy,
        entity.ApprovedBy,
        entity.ApprovedDate,
        entity.CreatedDate);
}

public record ApproveStandardCostCardCommand(int Id) : IRequest;

public class ApproveStandardCostCardCommandHandler : IRequestHandler<ApproveStandardCostCardCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveStandardCostCardCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveStandardCostCardCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var card = await _unitOfWork.StandardCostCards.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan standart maliyet kartı bulunamadı.");

        if (card.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu karta erişim yetkiniz yok.");

        card.Approve(userName);

        _unitOfWork.StandardCostCards.Update(card);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record SetAsCurrentCostCardCommand(int Id) : IRequest;

public class SetAsCurrentCostCardCommandHandler : IRequestHandler<SetAsCurrentCostCardCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SetAsCurrentCostCardCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SetAsCurrentCostCardCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var card = await _unitOfWork.StandardCostCards.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan standart maliyet kartı bulunamadı.");

        if (card.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu karta erişim yetkiniz yok.");

        // Set all other cards for this product as historical
        var productCards = await _unitOfWork.StandardCostCards.GetByProductAsync(card.ProductId, cancellationToken);
        foreach (var otherCard in productCards.Where(c => c.TenantId == tenantId && c.IsCurrent))
        {
            otherCard.SetAsHistorical();
            _unitOfWork.StandardCostCards.Update(otherCard);
        }

        card.SetAsCurrent();
        _unitOfWork.StandardCostCards.Update(card);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteStandardCostCardCommand(int Id) : IRequest;

public class DeleteStandardCostCardCommandHandler : IRequestHandler<DeleteStandardCostCardCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteStandardCostCardCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteStandardCostCardCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var card = await _unitOfWork.StandardCostCards.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan standart maliyet kartı bulunamadı.");

        if (card.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kartı silme yetkiniz yok.");

        if (card.IsCurrent)
            throw new InvalidOperationException("Aktif standart maliyet kartı silinemez.");

        if (card.ApprovedDate.HasValue)
            throw new InvalidOperationException("Onaylanmış standart maliyet kartı silinemez.");

        _unitOfWork.StandardCostCards.Delete(card);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

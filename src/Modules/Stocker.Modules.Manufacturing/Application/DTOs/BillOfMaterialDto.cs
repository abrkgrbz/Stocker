namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record BillOfMaterialDto(
    int Id,
    string Code,
    string Name,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    string Version,
    int RevisionNumber,
    string Type,
    string Status,
    decimal BaseQuantity,
    string BaseUnit,
    decimal StandardYield,
    decimal ScrapRate,
    DateTime? EffectiveStartDate,
    DateTime? EffectiveEndDate,
    decimal? EstimatedMaterialCost,
    decimal? EstimatedLaborCost,
    decimal? EstimatedOverheadCost,
    decimal? TotalEstimatedCost,
    int? DefaultRoutingId,
    string? DefaultRoutingCode,
    bool IsDefault,
    bool IsActive,
    DateTime CreatedDate,
    string? ApprovedBy,
    DateTime? ApprovalDate,
    IReadOnlyList<BomLineDto> Lines,
    IReadOnlyList<BomCoProductDto> CoProducts);

public record BillOfMaterialListDto(
    int Id,
    string Code,
    string Name,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    string Version,
    string Type,
    string Status,
    decimal? TotalEstimatedCost,
    DateTime? EffectiveStartDate,
    bool IsDefault,
    bool IsActive);

public record BomLineDto(
    int Id,
    int Sequence,
    int ComponentProductId,
    string? ComponentCode,
    string? ComponentName,
    string Type,
    decimal Quantity,
    string Unit,
    decimal ScrapRate,
    decimal? UnitCost,
    decimal? TotalCost,
    bool IsPhantom,
    int? OperationSequence,
    string ConsumptionMethod,
    string ConsumptionTiming,
    bool IsActive);

public record BomCoProductDto(
    int Id,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    string Type,
    decimal Quantity,
    string Unit,
    decimal YieldPercent,
    decimal CostAllocationPercent,
    string CostAllocationMethod,
    decimal? UnitValue,
    decimal? TotalValue,
    bool IsActive);

public record CreateBillOfMaterialRequest(
    string Code,
    string Name,
    int ProductId,
    string Type,
    string BaseUnit,
    decimal BaseQuantity = 1,
    decimal StandardYield = 100,
    decimal ScrapRate = 0,
    DateTime? EffectiveStartDate = null,
    DateTime? EffectiveEndDate = null,
    int? DefaultRoutingId = null,
    string? Description = null,
    List<CreateBomLineRequest>? Lines = null,
    List<CreateBomCoProductRequest>? CoProducts = null);

public record CreateBomLineRequest(
    int ComponentProductId,
    decimal Quantity,
    string Unit,
    int Sequence,
    string Type = "Hammadde",
    decimal ScrapRate = 0,
    bool IsPhantom = false,
    int? OperationSequence = null,
    string ConsumptionMethod = "Backflush",
    string ConsumptionTiming = "Operasyon_Bitişi",
    string? Notes = null);

public record CreateBomCoProductRequest(
    int ProductId,
    decimal Quantity,
    string Unit,
    decimal CostAllocationPercent,
    string Type = "Yan_Ürün",
    decimal YieldPercent = 100,
    string CostAllocationMethod = "Sabit_Yüzde");

public record UpdateBillOfMaterialRequest(
    string Name,
    string? Description,
    string Type,
    decimal BaseQuantity,
    string BaseUnit,
    decimal StandardYield,
    decimal ScrapRate,
    DateTime? EffectiveStartDate,
    DateTime? EffectiveEndDate,
    int? DefaultRoutingId);

public record AddBomLineRequest(
    int ComponentProductId,
    decimal Quantity,
    string Unit,
    int Sequence,
    string Type = "Hammadde",
    decimal ScrapRate = 0,
    bool IsPhantom = false,
    int? OperationSequence = null,
    string ConsumptionMethod = "Backflush",
    string ConsumptionTiming = "Operasyon_Bitişi",
    string? Notes = null);

public record UpdateBomLineRequest(
    decimal Quantity,
    string Unit,
    int Sequence,
    string Type,
    decimal ScrapRate,
    bool IsPhantom,
    int? OperationSequence,
    string ConsumptionMethod,
    string ConsumptionTiming,
    string? Notes);

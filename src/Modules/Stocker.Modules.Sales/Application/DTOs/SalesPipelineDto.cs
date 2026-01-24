namespace Stocker.Modules.Sales.Application.DTOs;

public class SalesPipelineDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsDefault { get; init; }
    public bool IsActive { get; init; }
    public string Type { get; init; } = string.Empty;
    public int TotalOpportunities { get; init; }
    public decimal TotalPipelineValue { get; init; }
    public decimal AverageConversionRate { get; init; }
    public int AverageDaysToClose { get; init; }
    public List<PipelineStageDto> Stages { get; init; } = new();
}

public class SalesPipelineListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public bool IsActive { get; init; }
    public string Type { get; init; } = string.Empty;
    public int TotalOpportunities { get; init; }
    public decimal TotalPipelineValue { get; init; }
    public int StageCount { get; init; }
}

public class PipelineStageDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int OrderIndex { get; init; }
    public string Category { get; init; } = string.Empty;
    public int SuccessProbability { get; init; }
    public int OpportunityCount { get; init; }
    public decimal StageValue { get; init; }
    public bool RequiresApproval { get; init; }
    public int? MaxDaysInStage { get; init; }
    public string? Color { get; init; }
    public string? Icon { get; init; }
}

public class CreateSalesPipelineDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Type { get; init; }
    public bool CreateWithDefaultStages { get; init; } = true;
}

public class AddPipelineStageDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int OrderIndex { get; init; }
    public int SuccessProbability { get; init; }
    public string Category { get; init; } = string.Empty;
    public string? Color { get; init; }
    public string? Icon { get; init; }
}

public class UpdatePipelineDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Type { get; init; }
}

namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record SignalRMethodDto
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

public record SignalREventDto
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

public record MetricsStreamInfoDto
{
    public string SignalRHub { get; init; } = string.Empty;
    public List<SignalRMethodDto> Methods { get; init; } = new();
    public List<SignalREventDto> Events { get; init; } = new();
    public string Note { get; init; } = string.Empty;
}

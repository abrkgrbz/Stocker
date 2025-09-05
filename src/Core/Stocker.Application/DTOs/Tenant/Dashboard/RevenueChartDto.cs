namespace Stocker.Application.DTOs.Tenant.Dashboard;

public class RevenueChartDto
{
    public string[] Labels { get; set; } = Array.Empty<string>();
    public List<ChartDatasetDto> Datasets { get; set; } = new();
}

public class ChartDatasetDto
{
    public string Label { get; set; } = string.Empty;
    public decimal[] Data { get; set; } = Array.Empty<decimal>();
    public string BorderColor { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = string.Empty;
}
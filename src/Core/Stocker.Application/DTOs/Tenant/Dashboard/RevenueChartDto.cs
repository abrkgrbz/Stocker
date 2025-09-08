namespace Stocker.Application.DTOs.Tenant.Dashboard;

public class RevenueChartDto
{
    public string Period { get; set; } = string.Empty;
    public List<string> Labels { get; set; } = new();
    public List<decimal> Data { get; set; } = new();
    public List<decimal> Comparison { get; set; } = new();
    
    // Alternative structure for charting libraries
    public string[] GetLabelsArray() => Labels.ToArray();
    public List<ChartDatasetDto> GetDatasets() => new()
    {
        new() {
            Label = "Gelir",
            Data = Data.ToArray(),
            BorderColor = "#10b981",
            BackgroundColor = "rgba(16, 185, 129, 0.2)"
        },
        new() {
            Label = "Önceki Dönem",
            Data = Comparison.ToArray(),
            BorderColor = "#6b7280",
            BackgroundColor = "rgba(107, 114, 128, 0.2)"
        }
    };
}

public class ChartDatasetDto
{
    public string Label { get; set; } = string.Empty;
    public decimal[] Data { get; set; } = Array.Empty<decimal>();
    public string BorderColor { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = string.Empty;
}
namespace Stocker.Application.DTOs.Dashboard;

public class ActivityDto
{
    public DateTime Timestamp { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? EntityName { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
}
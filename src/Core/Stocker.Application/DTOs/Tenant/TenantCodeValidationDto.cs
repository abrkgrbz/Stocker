namespace Stocker.Application.DTOs.Tenant;

public class TenantCodeValidationDto
{
    public bool IsAvailable { get; set; }
    public string? Message { get; set; }
}
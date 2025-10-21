namespace Stocker.SharedKernel.DTOs.Migration;

public class MigrationModuleDto
{
    public string Module { get; set; } = string.Empty;
    public List<string> Migrations { get; set; } = new();
}

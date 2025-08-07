namespace Stocker.SharedKernel.Settings;

public class AdminCredentials
{
    public string DefaultAdminEmail { get; set; } = "admin@stocker.com";
    public string DefaultAdminPassword { get; set; } = string.Empty;
    public string DefaultAdminFirstName { get; set; } = "System";
    public string DefaultAdminLastName { get; set; } = "Administrator";
}
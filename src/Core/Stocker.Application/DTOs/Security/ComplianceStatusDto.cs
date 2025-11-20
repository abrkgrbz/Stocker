namespace Stocker.Application.DTOs.Security;

/// <summary>
/// Compliance status for GDPR, ISO27001, PCI-DSS
/// </summary>
public class ComplianceStatusDto
{
    public GdprComplianceDto Gdpr { get; set; } = new();
    public Iso27001ComplianceDto Iso27001 { get; set; } = new();
    public PciDssComplianceDto PciDss { get; set; } = new();
    public string OverallStatus { get; set; } = "compliant"; // compliant, partial, non-compliant
    public DateTime LastAuditDate { get; set; }
    public string? Notes { get; set; }
}

public class GdprComplianceDto
{
    public bool IsCompliant { get; set; }
    public string Status { get; set; } = "active"; // active, warning, critical
    public string Description { get; set; } = "Sistemimiz GDPR, ISO27001 ve PCI-DSS standartlarına uygun olarak denetlenmektedir. Düzenli denetimler ve güvenlik testleri yapılmaktadır.";
    public List<ComplianceCheckDto> Checks { get; set; } = new();
}

public class Iso27001ComplianceDto
{
    public bool IsCompliant { get; set; }
    public string Status { get; set; } = "active";
    public string Description { get; set; } = "ISO27001 information security management standards are being followed.";
    public List<ComplianceCheckDto> Checks { get; set; } = new();
}

public class PciDssComplianceDto
{
    public bool IsCompliant { get; set; }
    public string Status { get; set; } = "active";
    public string Description { get; set; } = "PCI-DSS payment card industry security standards are maintained.";
    public List<ComplianceCheckDto> Checks { get; set; } = new();
}

public class ComplianceCheckDto
{
    public string Name { get; set; } = string.Empty;
    public bool Passed { get; set; }
    public string? Details { get; set; }
    public DateTime LastChecked { get; set; }
}

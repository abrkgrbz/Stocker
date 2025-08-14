using System.ComponentModel.DataAnnotations;

namespace Stocker.Application.DTOs.TenantInvoice;

public class CreateTenantInvoiceDto
{
    [Required]
    public string InvoiceNumber { get; set; } = string.Empty;
    
    [Required]
    public Guid CustomerId { get; set; }
    
    [Required]
    public DateTime InvoiceDate { get; set; }
    
    [Required]
    public DateTime DueDate { get; set; }
    
    public string Currency { get; set; } = "TRY";
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    
    public List<CreateTenantInvoiceItemDto> Items { get; set; } = new();
}

public class CreateTenantInvoiceItemDto
{
    [Required]
    public Guid ProductId { get; set; }
    
    [Required]
    public string ProductName { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Quantity { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }
    
    [Range(0, 100)]
    public decimal? DiscountPercentage { get; set; }
    
    [Range(0, 100)]
    public decimal? TaxRate { get; set; }
}
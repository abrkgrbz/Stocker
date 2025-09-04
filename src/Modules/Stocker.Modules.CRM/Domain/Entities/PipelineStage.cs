using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

public class PipelineStage : TenantEntity
{
    public int PipelineId { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public decimal Probability { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsWon { get; private set; }
    public bool IsLost { get; private set; }
    public bool IsActive { get; private set; }
    public string? Color { get; private set; }
    public int? RottenDays { get; private set; }
    
    public virtual Pipeline Pipeline { get; private set; }
    
    protected PipelineStage() { }
    
    public PipelineStage(
        Guid tenantId,
        int pipelineId,
        string name,
        decimal probability,
        int displayOrder,
        bool isWon = false,
        bool isLost = false) : base(tenantId)
    {
        PipelineId = pipelineId;
        Name = name;
        Probability = probability;
        DisplayOrder = displayOrder;
        IsWon = isWon;
        IsLost = isLost;
        IsActive = true;
        
        // Set default colors based on stage type
        if (isWon)
            Color = "#28a745"; // Green for won
        else if (isLost)
            Color = "#dc3545"; // Red for lost
        else
            Color = "#007bff"; // Blue for active stages
    }
    
    public void UpdateDetails(string name, string? description, decimal probability)
    {
        Name = name;
        Description = description;
        Probability = probability;
    }
    
    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }
    
    public void SetColor(string color)
    {
        Color = color;
    }
    
    public void SetRottenDays(int? days)
    {
        RottenDays = days;
    }
    
    public void MarkAsWon()
    {
        IsWon = true;
        IsLost = false;
        Probability = 100;
    }
    
    public void MarkAsLost()
    {
        IsWon = false;
        IsLost = true;
        Probability = 0;
    }
    
    public void MarkAsActive()
    {
        IsWon = false;
        IsLost = false;
    }
    
    public void Activate()
    {
        IsActive = true;
    }
    
    public void Deactivate()
    {
        IsActive = false;
    }
    
    public bool IsFinalStage()
    {
        return IsWon || IsLost;
    }
}
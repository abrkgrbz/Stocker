using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class Pipeline : TenantAggregateRoot
{
    private readonly List<PipelineStage> _stages = new();
    
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public PipelineType Type { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDefault { get; private set; }
    public int DisplayOrder { get; private set; }
    public string? Currency { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    public virtual IReadOnlyCollection<PipelineStage> Stages => _stages.AsReadOnly();
    
    protected Pipeline() : base() { }
    
    public Pipeline(
        Guid tenantId,
        string name,
        PipelineType type,
        string currency = "TRY") : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        Type = type;
        Currency = currency;
        IsActive = true;
        IsDefault = false;
        DisplayOrder = 0;
        CreatedAt = DateTime.UtcNow;
    }
    
    public void UpdateDetails(string name, string? description)
    {
        Name = name;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetAsDefault()
    {
        IsDefault = true;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UnsetDefault()
    {
        IsDefault = false;
    }
    
    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Activate()
    {
        IsActive = true;
    }
    
    public void Deactivate()
    {
        if (IsDefault)
            throw new InvalidOperationException("Cannot deactivate default pipeline");
            
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public PipelineStage AddStage(string name, decimal probability, int order, bool isWon = false, bool isLost = false)
    {
        if (_stages.Any(s => s.Name == name))
            throw new InvalidOperationException($"Stage with name '{name}' already exists in this pipeline");
            
        if (_stages.Any(s => s.DisplayOrder == order))
            throw new InvalidOperationException($"Stage with order {order} already exists in this pipeline");
            
        var stage = new PipelineStage(TenantId, Id, name, probability, order, isWon, isLost);
        _stages.Add(stage);
        
        return stage;
    }
    
    public void RemoveStage(Guid stageId)
    {
        var stage = _stages.FirstOrDefault(s => s.Id == stageId);
        if (stage == null)
            throw new InvalidOperationException("Stage not found in this pipeline");
            
        // Check if stage has any deals/opportunities
        // This would need to be checked at the application service level
        
        _stages.Remove(stage);
        
        // Reorder remaining stages
        var orderedStages = _stages.OrderBy(s => s.DisplayOrder).ToList();
        for (int i = 0; i < orderedStages.Count; i++)
        {
            orderedStages[i].SetDisplayOrder(i + 1);
        }
    }
    
    public void ReorderStages(List<Guid> stageIds)
    {
        if (stageIds.Count != _stages.Count)
            throw new ArgumentException("Must provide all stage IDs for reordering");
            
        for (int i = 0; i < stageIds.Count; i++)
        {
            var stage = _stages.FirstOrDefault(s => s.Id == stageIds[i]);
            if (stage == null)
                throw new ArgumentException($"Stage with ID {stageIds[i]} not found in this pipeline");
                
            stage.SetDisplayOrder(i + 1);
        }
    }
    
    public PipelineStage? GetFirstStage()
    {
        return _stages.OrderBy(s => s.DisplayOrder).FirstOrDefault();
    }
    
    public PipelineStage? GetLastStage()
    {
        return _stages.OrderBy(s => s.DisplayOrder).LastOrDefault();
    }
    
    public PipelineStage? GetNextStage(Guid currentStageId)
    {
        var currentStage = _stages.FirstOrDefault(s => s.Id == currentStageId);
        if (currentStage == null)
            return null;
            
        return _stages
            .Where(s => s.DisplayOrder > currentStage.DisplayOrder)
            .OrderBy(s => s.DisplayOrder)
            .FirstOrDefault();
    }
    
    public PipelineStage? GetPreviousStage(Guid currentStageId)
    {
        var currentStage = _stages.FirstOrDefault(s => s.Id == currentStageId);
        if (currentStage == null)
            return null;
            
        return _stages
            .Where(s => s.DisplayOrder < currentStage.DisplayOrder)
            .OrderByDescending(s => s.DisplayOrder)
            .FirstOrDefault();
    }
}
namespace Stocker.Modules.CRM.Domain.ValueObjects;

/// <summary>
/// Segment criteria for dynamic customer segmentation
/// </summary>
public class SegmentCriteria
{
    public string Operator { get; set; } = "AND";  // AND, OR
    public List<SegmentCondition> Conditions { get; set; } = new();
}

/// <summary>
/// Individual condition in segment criteria
/// </summary>
public class SegmentCondition
{
    public string Field { get; set; } = string.Empty;
    public string Operator { get; set; } = string.Empty;  // =, !=, >, <, >=, <=, IN, NOT_IN, CONTAINS, STARTS_WITH, ENDS_WITH
    public object? Value { get; set; }
}

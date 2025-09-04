using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

public class LeadScoringRule : TenantEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string Category { get; private set; }
    public string Field { get; private set; }
    public string Operator { get; private set; }
    public string? Value { get; private set; }
    public int Score { get; private set; }
    public bool IsActive { get; private set; }
    public int Priority { get; private set; }
    
    protected LeadScoringRule() { }
    
    public LeadScoringRule(
        Guid tenantId,
        string name,
        string category,
        string field,
        string @operator,
        int score,
        string? value = null) : base(tenantId)
    {
        Name = name;
        Category = category;
        Field = field;
        Operator = @operator;
        Score = score;
        Value = value;
        IsActive = true;
        Priority = 0;
    }
    
    public void UpdateRule(string name, string? description, int score)
    {
        Name = name;
        Description = description;
        Score = score;
    }
    
    public void SetCondition(string field, string @operator, string? value)
    {
        Field = field;
        Operator = @operator;
        Value = value;
    }
    
    public void SetPriority(int priority)
    {
        Priority = priority;
    }
    
    public void Activate()
    {
        IsActive = true;
    }
    
    public void Deactivate()
    {
        IsActive = false;
    }
    
    public bool EvaluateRule(Lead lead)
    {
        // This would typically use reflection or a strategy pattern to evaluate
        // For demonstration, here's a simplified version
        return Field.ToLower() switch
        {
            "email" => EvaluateEmailRule(lead),
            "company" => EvaluateCompanyRule(lead),
            "jobttitle" => EvaluateJobTitleRule(lead),
            "source" => EvaluateSourceRule(lead),
            "industry" => EvaluateIndustryRule(lead),
            "website" => EvaluateWebsiteRule(lead),
            "phone" => EvaluatePhoneRule(lead),
            "country" => EvaluateCountryRule(lead),
            "employeecount" => EvaluateEmployeeCountRule(lead),
            "annualrevenue" => EvaluateAnnualRevenueRule(lead),
            _ => false
        };
    }
    
    private bool EvaluateEmailRule(Lead lead)
    {
        if (string.IsNullOrEmpty(lead.Email))
            return false;
            
        return Operator.ToLower() switch
        {
            "contains" => lead.Email.Contains(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "endswith" => lead.Email.EndsWith(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "equals" => lead.Email.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "notequals" => !lead.Email.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "exists" => !string.IsNullOrEmpty(lead.Email),
            "notexists" => string.IsNullOrEmpty(lead.Email),
            _ => false
        };
    }
    
    private bool EvaluateCompanyRule(Lead lead)
    {
        if (string.IsNullOrEmpty(lead.CompanyName))
            return Operator.ToLower() == "notexists";
            
        return Operator.ToLower() switch
        {
            "contains" => lead.CompanyName.Contains(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "equals" => lead.CompanyName.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "notequals" => !lead.CompanyName.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "exists" => true,
            "notexists" => false,
            _ => false
        };
    }
    
    private bool EvaluateJobTitleRule(Lead lead)
    {
        if (string.IsNullOrEmpty(lead.JobTitle))
            return Operator.ToLower() == "notexists";
            
        var jobTitle = lead.JobTitle.ToLower();
        var isExecutive = jobTitle.Contains("ceo") || jobTitle.Contains("cto") || 
                         jobTitle.Contains("cfo") || jobTitle.Contains("president") ||
                         jobTitle.Contains("director") || jobTitle.Contains("vp") ||
                         jobTitle.Contains("vice president") || jobTitle.Contains("chief");
        
        return Operator.ToLower() switch
        {
            "contains" => jobTitle.Contains(Value?.ToLower() ?? ""),
            "equals" => jobTitle.Equals(Value?.ToLower() ?? ""),
            "isexecutive" => isExecutive,
            "isnotexecutive" => !isExecutive,
            "exists" => true,
            _ => false
        };
    }
    
    private bool EvaluateSourceRule(Lead lead)
    {
        if (string.IsNullOrEmpty(lead.Source))
            return false;
            
        return Operator.ToLower() switch
        {
            "equals" => lead.Source.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "notequals" => !lead.Source.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "in" => Value?.Split(',').Any(v => v.Trim().Equals(lead.Source, StringComparison.OrdinalIgnoreCase)) ?? false,
            _ => false
        };
    }
    
    private bool EvaluateIndustryRule(Lead lead)
    {
        if (string.IsNullOrEmpty(lead.Industry))
            return false;
            
        return Operator.ToLower() switch
        {
            "equals" => lead.Industry.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "notequals" => !lead.Industry.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "in" => Value?.Split(',').Any(v => v.Trim().Equals(lead.Industry, StringComparison.OrdinalIgnoreCase)) ?? false,
            _ => false
        };
    }
    
    private bool EvaluateWebsiteRule(Lead lead)
    {
        return Operator.ToLower() switch
        {
            "exists" => !string.IsNullOrEmpty(lead.Website),
            "notexists" => string.IsNullOrEmpty(lead.Website),
            _ => false
        };
    }
    
    private bool EvaluatePhoneRule(Lead lead)
    {
        return Operator.ToLower() switch
        {
            "exists" => !string.IsNullOrEmpty(lead.Phone) || !string.IsNullOrEmpty(lead.MobilePhone),
            "notexists" => string.IsNullOrEmpty(lead.Phone) && string.IsNullOrEmpty(lead.MobilePhone),
            _ => false
        };
    }
    
    private bool EvaluateCountryRule(Lead lead)
    {
        if (string.IsNullOrEmpty(lead.Country))
            return false;
            
        return Operator.ToLower() switch
        {
            "equals" => lead.Country.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "notequals" => !lead.Country.Equals(Value ?? "", StringComparison.OrdinalIgnoreCase),
            "in" => Value?.Split(',').Any(v => v.Trim().Equals(lead.Country, StringComparison.OrdinalIgnoreCase)) ?? false,
            _ => false
        };
    }
    
    private bool EvaluateEmployeeCountRule(Lead lead)
    {
        if (!lead.NumberOfEmployees.HasValue || !int.TryParse(Value, out var targetValue))
            return false;
            
        return Operator.ToLower() switch
        {
            "equals" => lead.NumberOfEmployees == targetValue,
            "greaterthan" => lead.NumberOfEmployees > targetValue,
            "lessthan" => lead.NumberOfEmployees < targetValue,
            "greaterthanorequal" => lead.NumberOfEmployees >= targetValue,
            "lessthanorequal" => lead.NumberOfEmployees <= targetValue,
            _ => false
        };
    }
    
    private bool EvaluateAnnualRevenueRule(Lead lead)
    {
        if (!lead.AnnualRevenue.HasValue || !decimal.TryParse(Value, out var targetValue))
            return false;
            
        return Operator.ToLower() switch
        {
            "equals" => lead.AnnualRevenue == targetValue,
            "greaterthan" => lead.AnnualRevenue > targetValue,
            "lessthan" => lead.AnnualRevenue < targetValue,
            "greaterthanorequal" => lead.AnnualRevenue >= targetValue,
            "lessthanorequal" => lead.AnnualRevenue <= targetValue,
            _ => false
        };
    }
}

public class LeadScoringHistory : TenantEntity
{
    public int LeadId { get; private set; }
    public int PreviousScore { get; private set; }
    public int NewScore { get; private set; }
    public string? RuleApplied { get; private set; }
    public int ScoreChange { get; private set; }
    public string? Reason { get; private set; }
    public DateTime ScoredAt { get; private set; }
    
    public virtual Lead Lead { get; private set; }
    
    protected LeadScoringHistory() { }
    
    public LeadScoringHistory(
        Guid tenantId,
        int leadId,
        int previousScore,
        int newScore,
        string? ruleApplied,
        string? reason) : base(tenantId)
    {
        LeadId = leadId;
        PreviousScore = previousScore;
        NewScore = newScore;
        RuleApplied = ruleApplied;
        ScoreChange = newScore - previousScore;
        Reason = reason;
        ScoredAt = DateTime.UtcNow;
    }
}
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Tedarikçi Değerlendirme / Supplier Evaluation
/// </summary>
public class SupplierEvaluation : TenantAggregateRoot
{
    public string EvaluationNumber { get; private set; } = string.Empty;
    public Guid SupplierId { get; private set; }
    public string SupplierCode { get; private set; } = string.Empty;
    public string SupplierName { get; private set; } = string.Empty;
    public SupplierEvaluationStatus Status { get; private set; }
    public SupplierEvaluationType Type { get; private set; }

    // Period
    public EvaluationPeriodType PeriodType { get; private set; }
    public int Year { get; private set; }
    public int? Quarter { get; private set; }
    public int? Month { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }

    // Scores (0-100)
    public decimal QualityScore { get; private set; }
    public decimal DeliveryScore { get; private set; }
    public decimal PriceScore { get; private set; }
    public decimal ServiceScore { get; private set; }
    public decimal CommunicationScore { get; private set; }
    public decimal OverallScore { get; private set; }

    // Weights (percentage, total = 100)
    public decimal QualityWeight { get; private set; }
    public decimal DeliveryWeight { get; private set; }
    public decimal PriceWeight { get; private set; }
    public decimal ServiceWeight { get; private set; }
    public decimal CommunicationWeight { get; private set; }

    // Performance metrics
    public int TotalOrders { get; private set; }
    public int OnTimeDeliveries { get; private set; }
    public decimal OnTimeDeliveryRate { get; private set; }
    public int TotalItems { get; private set; }
    public int AcceptedItems { get; private set; }
    public int RejectedItems { get; private set; }
    public decimal AcceptanceRate { get; private set; }
    public decimal AverageLeadTimeDays { get; private set; }
    public int TotalReturns { get; private set; }
    public decimal ReturnRate { get; private set; }
    public decimal TotalPurchaseAmount { get; private set; }
    public decimal AverageOrderValue { get; private set; }

    // Comparison with previous period
    public decimal? PreviousOverallScore { get; private set; }
    public decimal? ScoreChange { get; private set; }
    public string? ScoreTrend { get; private set; }

    // Ranking
    public SupplierRating Rating { get; private set; }
    public int? RankInCategory { get; private set; }
    public int? TotalSuppliersInCategory { get; private set; }

    // Evaluator
    public Guid? EvaluatedById { get; private set; }
    public string? EvaluatedByName { get; private set; }
    public DateTime? EvaluationDate { get; private set; }

    // Comments
    public string? Strengths { get; private set; }
    public string? Weaknesses { get; private set; }
    public string? ImprovementAreas { get; private set; }
    public string? Recommendations { get; private set; }
    public string? Notes { get; private set; }

    // Follow-up
    public bool RequiresFollowUp { get; private set; }
    public DateTime? FollowUpDate { get; private set; }
    public string? FollowUpNotes { get; private set; }
    public bool FollowUpCompleted { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<SupplierEvaluationCriteria> _criteria = new();
    public IReadOnlyCollection<SupplierEvaluationCriteria> Criteria => _criteria.AsReadOnly();

    private readonly List<SupplierEvaluationHistory> _history = new();
    public IReadOnlyCollection<SupplierEvaluationHistory> History => _history.AsReadOnly();

    protected SupplierEvaluation() : base() { }

    public static SupplierEvaluation Create(
        string evaluationNumber,
        Guid supplierId,
        string supplierCode,
        string supplierName,
        int year,
        DateTime startDate,
        DateTime endDate,
        Guid tenantId,
        SupplierEvaluationType type = SupplierEvaluationType.Periodic,
        EvaluationPeriodType periodType = EvaluationPeriodType.Quarterly,
        int? quarter = null,
        int? month = null)
    {
        var evaluation = new SupplierEvaluation();
        evaluation.Id = Guid.NewGuid();
        evaluation.SetTenantId(tenantId);
        evaluation.EvaluationNumber = evaluationNumber;
        evaluation.SupplierId = supplierId;
        evaluation.SupplierCode = supplierCode;
        evaluation.SupplierName = supplierName;
        evaluation.Year = year;
        evaluation.Quarter = quarter;
        evaluation.Month = month;
        evaluation.StartDate = startDate;
        evaluation.EndDate = endDate;
        evaluation.Type = type;
        evaluation.PeriodType = periodType;
        evaluation.Status = SupplierEvaluationStatus.Draft;

        // Default weights
        evaluation.QualityWeight = 25;
        evaluation.DeliveryWeight = 25;
        evaluation.PriceWeight = 20;
        evaluation.ServiceWeight = 15;
        evaluation.CommunicationWeight = 15;

        evaluation.CreatedAt = DateTime.UtcNow;
        return evaluation;
    }

    public void SetWeights(
        decimal qualityWeight,
        decimal deliveryWeight,
        decimal priceWeight,
        decimal serviceWeight,
        decimal communicationWeight)
    {
        var total = qualityWeight + deliveryWeight + priceWeight + serviceWeight + communicationWeight;
        if (Math.Abs(total - 100) > 0.01m)
            throw new InvalidOperationException("Total weights must equal 100%.");

        QualityWeight = qualityWeight;
        DeliveryWeight = deliveryWeight;
        PriceWeight = priceWeight;
        ServiceWeight = serviceWeight;
        CommunicationWeight = communicationWeight;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetScores(
        decimal qualityScore,
        decimal deliveryScore,
        decimal priceScore,
        decimal serviceScore,
        decimal communicationScore)
    {
        ValidateScore(qualityScore, nameof(qualityScore));
        ValidateScore(deliveryScore, nameof(deliveryScore));
        ValidateScore(priceScore, nameof(priceScore));
        ValidateScore(serviceScore, nameof(serviceScore));
        ValidateScore(communicationScore, nameof(communicationScore));

        QualityScore = qualityScore;
        DeliveryScore = deliveryScore;
        PriceScore = priceScore;
        ServiceScore = serviceScore;
        CommunicationScore = communicationScore;
        CalculateOverallScore();
        UpdatedAt = DateTime.UtcNow;
    }

    private void ValidateScore(decimal score, string name)
    {
        if (score < 0 || score > 100)
            throw new ArgumentOutOfRangeException(name, "Score must be between 0 and 100.");
    }

    public void SetPerformanceMetrics(
        int totalOrders,
        int onTimeDeliveries,
        int totalItems,
        int acceptedItems,
        int rejectedItems,
        decimal averageLeadTimeDays,
        int totalReturns,
        decimal totalPurchaseAmount)
    {
        TotalOrders = totalOrders;
        OnTimeDeliveries = onTimeDeliveries;
        TotalItems = totalItems;
        AcceptedItems = acceptedItems;
        RejectedItems = rejectedItems;
        AverageLeadTimeDays = averageLeadTimeDays;
        TotalReturns = totalReturns;
        TotalPurchaseAmount = totalPurchaseAmount;

        // Calculate rates
        OnTimeDeliveryRate = totalOrders > 0 ? (decimal)onTimeDeliveries / totalOrders * 100 : 0;
        AcceptanceRate = totalItems > 0 ? (decimal)acceptedItems / totalItems * 100 : 0;
        ReturnRate = totalOrders > 0 ? (decimal)totalReturns / totalOrders * 100 : 0;
        AverageOrderValue = totalOrders > 0 ? totalPurchaseAmount / totalOrders : 0;

        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPreviousScore(decimal? previousScore)
    {
        PreviousOverallScore = previousScore;
        if (previousScore.HasValue)
        {
            ScoreChange = OverallScore - previousScore.Value;
            ScoreTrend = ScoreChange > 0 ? "Improving" : ScoreChange < 0 ? "Declining" : "Stable";
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetComments(
        string? strengths,
        string? weaknesses,
        string? improvementAreas,
        string? recommendations,
        string? notes)
    {
        Strengths = strengths;
        Weaknesses = weaknesses;
        ImprovementAreas = improvementAreas;
        Recommendations = recommendations;
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFollowUp(bool requiresFollowUp, DateTime? followUpDate, string? followUpNotes)
    {
        RequiresFollowUp = requiresFollowUp;
        FollowUpDate = followUpDate;
        FollowUpNotes = followUpNotes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void CompleteFollowUp()
    {
        FollowUpCompleted = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRanking(int rankInCategory, int totalSuppliersInCategory)
    {
        RankInCategory = rankInCategory;
        TotalSuppliersInCategory = totalSuppliersInCategory;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddCriteria(SupplierEvaluationCriteria criteria)
    {
        _criteria.Add(criteria);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveCriteria(Guid criteriaId)
    {
        var criteria = _criteria.FirstOrDefault(c => c.Id == criteriaId);
        if (criteria != null)
        {
            _criteria.Remove(criteria);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    private void CalculateOverallScore()
    {
        OverallScore = (QualityScore * QualityWeight +
                       DeliveryScore * DeliveryWeight +
                       PriceScore * PriceWeight +
                       ServiceScore * ServiceWeight +
                       CommunicationScore * CommunicationWeight) / 100;

        // Determine rating
        Rating = OverallScore switch
        {
            >= 90 => SupplierRating.Excellent,
            >= 80 => SupplierRating.Good,
            >= 70 => SupplierRating.Satisfactory,
            >= 60 => SupplierRating.NeedsImprovement,
            _ => SupplierRating.Poor
        };
    }

    public void Submit()
    {
        if (Status != SupplierEvaluationStatus.Draft)
            throw new InvalidOperationException("Only draft evaluations can be submitted.");

        Status = SupplierEvaluationStatus.PendingReview;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid evaluatedById, string evaluatedByName)
    {
        if (Status != SupplierEvaluationStatus.PendingReview)
            throw new InvalidOperationException("Only pending evaluations can be approved.");

        Status = SupplierEvaluationStatus.Completed;
        EvaluatedById = evaluatedById;
        EvaluatedByName = evaluatedByName;
        EvaluationDate = DateTime.UtcNow;

        // Save to history
        var historyEntry = SupplierEvaluationHistory.Create(
            SupplierId,
            TenantId,
            Year,
            Quarter,
            Month,
            OverallScore,
            QualityScore,
            DeliveryScore,
            PriceScore,
            ServiceScore,
            CommunicationScore,
            Rating);
        _history.Add(historyEntry);

        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != SupplierEvaluationStatus.PendingReview)
            throw new InvalidOperationException("Only pending evaluations can be rejected.");

        Status = SupplierEvaluationStatus.Draft;
        Notes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        if (Status != SupplierEvaluationStatus.Completed)
            throw new InvalidOperationException("Only completed evaluations can be archived.");

        Status = SupplierEvaluationStatus.Archived;
        UpdatedAt = DateTime.UtcNow;
    }
}

public class SupplierEvaluationCriteria : TenantEntity
{
    public Guid EvaluationId { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Weight { get; private set; }
    public decimal Score { get; private set; }
    public decimal WeightedScore { get; private set; }
    public string? Evidence { get; private set; }
    public string? Notes { get; private set; }

    protected SupplierEvaluationCriteria() : base() { }

    public static SupplierEvaluationCriteria Create(
        Guid evaluationId,
        Guid tenantId,
        string category,
        string name,
        decimal weight,
        decimal score,
        string? description = null,
        string? evidence = null,
        string? notes = null)
    {
        var criteria = new SupplierEvaluationCriteria();
        criteria.Id = Guid.NewGuid();
        criteria.SetTenantId(tenantId);
        criteria.EvaluationId = evaluationId;
        criteria.Category = category;
        criteria.Name = name;
        criteria.Description = description;
        criteria.Weight = weight;
        criteria.Score = score;
        criteria.WeightedScore = score * weight / 100;
        criteria.Evidence = evidence;
        criteria.Notes = notes;
        return criteria;
    }

    public void UpdateScore(decimal score)
    {
        Score = score;
        WeightedScore = score * Weight / 100;
    }
}

public class SupplierEvaluationHistory : TenantEntity
{
    public Guid SupplierId { get; private set; }
    public int Year { get; private set; }
    public int? Quarter { get; private set; }
    public int? Month { get; private set; }
    public decimal OverallScore { get; private set; }
    public decimal QualityScore { get; private set; }
    public decimal DeliveryScore { get; private set; }
    public decimal PriceScore { get; private set; }
    public decimal ServiceScore { get; private set; }
    public decimal CommunicationScore { get; private set; }
    public SupplierRating Rating { get; private set; }
    public DateTime RecordedAt { get; private set; }

    protected SupplierEvaluationHistory() : base() { }

    public static SupplierEvaluationHistory Create(
        Guid supplierId,
        Guid tenantId,
        int year,
        int? quarter,
        int? month,
        decimal overallScore,
        decimal qualityScore,
        decimal deliveryScore,
        decimal priceScore,
        decimal serviceScore,
        decimal communicationScore,
        SupplierRating rating)
    {
        var history = new SupplierEvaluationHistory();
        history.Id = Guid.NewGuid();
        history.SetTenantId(tenantId);
        history.SupplierId = supplierId;
        history.Year = year;
        history.Quarter = quarter;
        history.Month = month;
        history.OverallScore = overallScore;
        history.QualityScore = qualityScore;
        history.DeliveryScore = deliveryScore;
        history.PriceScore = priceScore;
        history.ServiceScore = serviceScore;
        history.CommunicationScore = communicationScore;
        history.Rating = rating;
        history.RecordedAt = DateTime.UtcNow;
        return history;
    }
}

// Enums
public enum SupplierEvaluationStatus
{
    Draft,
    PendingReview,
    Completed,
    Archived
}

public enum SupplierEvaluationType
{
    Periodic,
    Initial,
    Incident,
    Audit,
    Recertification
}

public enum EvaluationPeriodType
{
    Monthly,
    Quarterly,
    SemiAnnual,
    Annual
}

public enum SupplierRating
{
    Excellent,
    Good,
    Satisfactory,
    NeedsImprovement,
    Poor
}

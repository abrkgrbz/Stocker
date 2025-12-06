using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Performans değerlendirme kriteri entity'si
/// </summary>
public class PerformanceReviewCriteria : BaseEntity
{
    public int PerformanceReviewId { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public decimal Weight { get; private set; }
    public PerformanceRating? Rating { get; private set; }
    public decimal? Score { get; private set; }
    public string? Comments { get; private set; }
    public int DisplayOrder { get; private set; }

    // Navigation Properties
    public virtual PerformanceReview PerformanceReview { get; private set; } = null!;

    protected PerformanceReviewCriteria()
    {
        Name = string.Empty;
    }

    public PerformanceReviewCriteria(
        int performanceReviewId,
        string name,
        decimal weight = 1,
        string? description = null,
        int displayOrder = 0)
    {
        PerformanceReviewId = performanceReviewId;
        Name = name;
        Weight = weight;
        Description = description;
        DisplayOrder = displayOrder;
    }

    public void SetRating(PerformanceRating rating, string? comments = null)
    {
        Rating = rating;
        Score = (int)rating;
        Comments = comments;
    }

    public void SetScore(decimal score, string? comments = null)
    {
        if (score < 0 || score > 5)
            throw new ArgumentException("Score must be between 0 and 5");

        Score = score;
        Comments = comments;

        // Auto-map to rating
        Rating = score switch
        {
            >= 4.5m => PerformanceRating.Outstanding,
            >= 3.5m => PerformanceRating.ExceedsExpectations,
            >= 2.5m => PerformanceRating.MeetsExpectations,
            >= 1.5m => PerformanceRating.NeedsImprovement,
            _ => PerformanceRating.Unsatisfactory
        };
    }

    public void UpdateWeight(decimal weight)
    {
        Weight = weight;
    }

    public void SetComments(string? comments)
    {
        Comments = comments;
    }

    public decimal GetWeightedScore()
    {
        return (Score ?? 0) * Weight;
    }
}

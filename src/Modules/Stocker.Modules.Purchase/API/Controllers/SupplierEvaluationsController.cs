using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class SupplierEvaluationsController : ControllerBase
{
    private readonly PurchaseDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public SupplierEvaluationsController(
        PurchaseDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvaluations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] SupplierEvaluationStatus? status = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] int? year = null,
        [FromQuery] SupplierRating? rating = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = _context.SupplierEvaluations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(e => e.EvaluationNumber.Contains(searchTerm) || e.SupplierName.Contains(searchTerm));

        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        if (supplierId.HasValue)
            query = query.Where(e => e.SupplierId == supplierId.Value);

        if (year.HasValue)
            query = query.Where(e => e.Year == year.Value);

        if (rating.HasValue)
            query = query.Where(e => e.Rating == rating.Value);

        query = sortBy?.ToLower() switch
        {
            "number" => sortDescending ? query.OrderByDescending(e => e.EvaluationNumber) : query.OrderBy(e => e.EvaluationNumber),
            "supplier" => sortDescending ? query.OrderByDescending(e => e.SupplierName) : query.OrderBy(e => e.SupplierName),
            "score" => sortDescending ? query.OrderByDescending(e => e.OverallScore) : query.OrderBy(e => e.OverallScore),
            "rating" => sortDescending ? query.OrderByDescending(e => e.Rating) : query.OrderBy(e => e.Rating),
            _ => sortDescending ? query.OrderByDescending(e => e.CreatedAt) : query.OrderBy(e => e.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(e => new SupplierEvaluationListDto
            {
                Id = e.Id,
                EvaluationNumber = e.EvaluationNumber,
                SupplierName = e.SupplierName,
                Status = e.Status.ToString(),
                Type = e.Type.ToString(),
                PeriodType = e.PeriodType.ToString(),
                Year = e.Year,
                Quarter = e.Quarter,
                OverallScore = e.OverallScore,
                Rating = e.Rating.ToString(),
                ScoreTrend = e.ScoreTrend,
                RequiresFollowUp = e.RequiresFollowUp,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetEvaluation(Guid id)
    {
        var evaluation = await _context.SupplierEvaluations
            .Include(e => e.Criteria)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (evaluation == null)
            return NotFound("Evaluation not found");

        return Ok(MapToDto(evaluation));
    }

    [HttpGet("supplier/{supplierId:guid}/history")]
    public async Task<IActionResult> GetSupplierHistory(Guid supplierId)
    {
        var history = await _context.SupplierEvaluationHistory
            .Where(h => h.SupplierId == supplierId)
            .OrderByDescending(h => h.Year).ThenByDescending(h => h.Quarter)
            .Select(h => new SupplierEvaluationHistoryDto
            {
                Id = h.Id,
                SupplierId = h.SupplierId,
                Year = h.Year,
                Quarter = h.Quarter,
                Month = h.Month,
                OverallScore = h.OverallScore,
                QualityScore = h.QualityScore,
                DeliveryScore = h.DeliveryScore,
                PriceScore = h.PriceScore,
                ServiceScore = h.ServiceScore,
                CommunicationScore = h.CommunicationScore,
                Rating = h.Rating.ToString(),
                RecordedAt = h.RecordedAt
            })
            .ToListAsync();

        return Ok(history);
    }

    [HttpGet("rankings")]
    public async Task<IActionResult> GetRankings([FromQuery] int? year = null, [FromQuery] int? quarter = null, [FromQuery] int top = 10)
    {
        var query = _context.SupplierEvaluations
            .Where(e => e.Status == SupplierEvaluationStatus.Completed)
            .AsQueryable();

        if (year.HasValue)
            query = query.Where(e => e.Year == year.Value);

        if (quarter.HasValue)
            query = query.Where(e => e.Quarter == quarter.Value);

        var rankings = await query
            .GroupBy(e => e.SupplierId)
            .Select(g => new
            {
                SupplierId = g.Key,
                LatestEvaluation = g.OrderByDescending(e => e.Year).ThenByDescending(e => e.Quarter).First()
            })
            .OrderByDescending(x => x.LatestEvaluation.OverallScore)
            .Take(top)
            .Select((x, index) => new SupplierRankingDto
            {
                SupplierId = x.SupplierId,
                SupplierCode = x.LatestEvaluation.SupplierCode,
                SupplierName = x.LatestEvaluation.SupplierName,
                OverallScore = x.LatestEvaluation.OverallScore,
                Rating = x.LatestEvaluation.Rating.ToString(),
                Rank = index + 1,
                QualityScore = x.LatestEvaluation.QualityScore,
                DeliveryScore = x.LatestEvaluation.DeliveryScore,
                PriceScore = x.LatestEvaluation.PriceScore,
                ServiceScore = x.LatestEvaluation.ServiceScore,
                CommunicationScore = x.LatestEvaluation.CommunicationScore,
                ScoreTrend = x.LatestEvaluation.ScoreTrend,
                TotalEvaluations = 1
            })
            .ToListAsync();

        return Ok(rankings);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int? year = null)
    {
        var query = _context.SupplierEvaluations.AsQueryable();
        if (year.HasValue)
            query = query.Where(e => e.Year == year.Value);

        var evaluations = await query.ToListAsync();

        return Ok(new SupplierEvaluationSummaryDto
        {
            TotalEvaluations = evaluations.Count,
            DraftEvaluations = evaluations.Count(e => e.Status == SupplierEvaluationStatus.Draft),
            PendingReviewEvaluations = evaluations.Count(e => e.Status == SupplierEvaluationStatus.PendingReview),
            CompletedEvaluations = evaluations.Count(e => e.Status == SupplierEvaluationStatus.Completed),
            AverageScore = evaluations.Where(e => e.Status == SupplierEvaluationStatus.Completed).DefaultIfEmpty().Average(e => e?.OverallScore ?? 0),
            ExcellentSuppliers = evaluations.Count(e => e.Rating == SupplierRating.Excellent),
            GoodSuppliers = evaluations.Count(e => e.Rating == SupplierRating.Good),
            SatisfactorySuppliers = evaluations.Count(e => e.Rating == SupplierRating.Satisfactory),
            NeedsImprovementSuppliers = evaluations.Count(e => e.Rating == SupplierRating.NeedsImprovement),
            PoorSuppliers = evaluations.Count(e => e.Rating == SupplierRating.Poor),
            SuppliersRequiringFollowUp = evaluations.Count(e => e.RequiresFollowUp && !e.FollowUpCompleted),
            EvaluationsByRating = evaluations.GroupBy(e => e.Rating.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            AverageScoreByCategory = new Dictionary<string, decimal>
            {
                ["Quality"] = evaluations.Where(e => e.Status == SupplierEvaluationStatus.Completed).DefaultIfEmpty().Average(e => e?.QualityScore ?? 0),
                ["Delivery"] = evaluations.Where(e => e.Status == SupplierEvaluationStatus.Completed).DefaultIfEmpty().Average(e => e?.DeliveryScore ?? 0),
                ["Price"] = evaluations.Where(e => e.Status == SupplierEvaluationStatus.Completed).DefaultIfEmpty().Average(e => e?.PriceScore ?? 0),
                ["Service"] = evaluations.Where(e => e.Status == SupplierEvaluationStatus.Completed).DefaultIfEmpty().Average(e => e?.ServiceScore ?? 0),
                ["Communication"] = evaluations.Where(e => e.Status == SupplierEvaluationStatus.Completed).DefaultIfEmpty().Average(e => e?.CommunicationScore ?? 0)
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvaluation([FromBody] CreateSupplierEvaluationDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var evaluationNumber = await GenerateEvaluationNumber();

        var evaluation = SupplierEvaluation.Create(
            evaluationNumber,
            dto.SupplierId,
            dto.SupplierCode ?? string.Empty,
            dto.SupplierName,
            dto.Year,
            dto.StartDate,
            dto.EndDate,
            tenantId.Value,
            dto.Type,
            dto.PeriodType,
            dto.Quarter,
            dto.Month);

        _context.SupplierEvaluations.Add(evaluation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvaluation), new { id = evaluation.Id }, MapToDto(evaluation));
    }

    [HttpPut("{id:guid}/weights")]
    public async Task<IActionResult> SetWeights(Guid id, [FromBody] SetEvaluationWeightsDto dto)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.SetWeights(dto.QualityWeight, dto.DeliveryWeight, dto.PriceWeight, dto.ServiceWeight, dto.CommunicationWeight);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPut("{id:guid}/scores")]
    public async Task<IActionResult> SetScores(Guid id, [FromBody] SetEvaluationScoresDto dto)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.SetScores(dto.QualityScore, dto.DeliveryScore, dto.PriceScore, dto.ServiceScore, dto.CommunicationScore);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPut("{id:guid}/metrics")]
    public async Task<IActionResult> SetMetrics(Guid id, [FromBody] SetPerformanceMetricsDto dto)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.SetPerformanceMetrics(dto.TotalOrders, dto.OnTimeDeliveries, dto.TotalItems, dto.AcceptedItems, dto.RejectedItems, dto.AverageLeadTimeDays, dto.TotalReturns, dto.TotalPurchaseAmount);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPut("{id:guid}/comments")]
    public async Task<IActionResult> SetComments(Guid id, [FromBody] SetEvaluationCommentsDto dto)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.SetComments(dto.Strengths, dto.Weaknesses, dto.ImprovementAreas, dto.Recommendations, dto.Notes);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPut("{id:guid}/follow-up")]
    public async Task<IActionResult> SetFollowUp(Guid id, [FromBody] SetFollowUpDto dto)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.SetFollowUp(dto.RequiresFollowUp, dto.FollowUpDate, dto.FollowUpNotes);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPost("{id:guid}/criteria")]
    public async Task<IActionResult> AddCriteria(Guid id, [FromBody] AddEvaluationCriteriaDto dto)
    {
        var evaluation = await _context.SupplierEvaluations.Include(e => e.Criteria).FirstOrDefaultAsync(e => e.Id == id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var criteria = SupplierEvaluationCriteria.Create(evaluation.Id, tenantId.Value, dto.Category, dto.Name, dto.Weight, dto.Score, dto.Description, dto.Evidence, dto.Notes);
        evaluation.AddCriteria(criteria);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(evaluation));
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.Submit();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var evaluation = await _context.SupplierEvaluations.Include(e => e.History).FirstOrDefaultAsync(e => e.Id == id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        var currentUser = _currentUserService.GetCurrentUser();
        evaluation.Approve(currentUser?.Id ?? Guid.Empty, currentUser?.Name ?? "System");
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectEvaluationRequest request)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.Reject(request.Reason);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpPost("{id:guid}/complete-follow-up")]
    public async Task<IActionResult> CompleteFollowUp(Guid id)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        evaluation.CompleteFollowUp();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(evaluation));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var evaluation = await _context.SupplierEvaluations.FindAsync(id);
        if (evaluation == null)
            return NotFound("Evaluation not found");

        if (evaluation.Status != SupplierEvaluationStatus.Draft)
            return BadRequest("Only draft evaluations can be deleted");

        _context.SupplierEvaluations.Remove(evaluation);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string> GenerateEvaluationNumber()
    {
        var today = DateTime.Today;
        var prefix = $"EVAL-{today:yyyyMM}";

        var lastNumber = await _context.SupplierEvaluations
            .Where(e => e.EvaluationNumber.StartsWith(prefix))
            .OrderByDescending(e => e.EvaluationNumber)
            .Select(e => e.EvaluationNumber)
            .FirstOrDefaultAsync();

        var sequence = 1;
        if (!string.IsNullOrEmpty(lastNumber))
        {
            var parts = lastNumber.Split('-');
            if (parts.Length > 2 && int.TryParse(parts[^1], out var lastSeq))
                sequence = lastSeq + 1;
        }

        return $"{prefix}-{sequence:D4}";
    }

    private static SupplierEvaluationDto MapToDto(SupplierEvaluation e)
    {
        return new SupplierEvaluationDto
        {
            Id = e.Id,
            EvaluationNumber = e.EvaluationNumber,
            SupplierId = e.SupplierId,
            SupplierCode = e.SupplierCode,
            SupplierName = e.SupplierName,
            Status = e.Status.ToString(),
            Type = e.Type.ToString(),
            PeriodType = e.PeriodType.ToString(),
            Year = e.Year,
            Quarter = e.Quarter,
            Month = e.Month,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            QualityScore = e.QualityScore,
            DeliveryScore = e.DeliveryScore,
            PriceScore = e.PriceScore,
            ServiceScore = e.ServiceScore,
            CommunicationScore = e.CommunicationScore,
            OverallScore = e.OverallScore,
            QualityWeight = e.QualityWeight,
            DeliveryWeight = e.DeliveryWeight,
            PriceWeight = e.PriceWeight,
            ServiceWeight = e.ServiceWeight,
            CommunicationWeight = e.CommunicationWeight,
            TotalOrders = e.TotalOrders,
            OnTimeDeliveries = e.OnTimeDeliveries,
            OnTimeDeliveryRate = e.OnTimeDeliveryRate,
            TotalItems = e.TotalItems,
            AcceptedItems = e.AcceptedItems,
            RejectedItems = e.RejectedItems,
            AcceptanceRate = e.AcceptanceRate,
            AverageLeadTimeDays = e.AverageLeadTimeDays,
            TotalReturns = e.TotalReturns,
            ReturnRate = e.ReturnRate,
            TotalPurchaseAmount = e.TotalPurchaseAmount,
            AverageOrderValue = e.AverageOrderValue,
            PreviousOverallScore = e.PreviousOverallScore,
            ScoreChange = e.ScoreChange,
            ScoreTrend = e.ScoreTrend,
            Rating = e.Rating.ToString(),
            RankInCategory = e.RankInCategory,
            TotalSuppliersInCategory = e.TotalSuppliersInCategory,
            EvaluatedById = e.EvaluatedById,
            EvaluatedByName = e.EvaluatedByName,
            EvaluationDate = e.EvaluationDate,
            Strengths = e.Strengths,
            Weaknesses = e.Weaknesses,
            ImprovementAreas = e.ImprovementAreas,
            Recommendations = e.Recommendations,
            Notes = e.Notes,
            RequiresFollowUp = e.RequiresFollowUp,
            FollowUpDate = e.FollowUpDate,
            FollowUpNotes = e.FollowUpNotes,
            FollowUpCompleted = e.FollowUpCompleted,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt,
            Criteria = e.Criteria.Select(c => new SupplierEvaluationCriteriaDto
            {
                Id = c.Id,
                EvaluationId = c.EvaluationId,
                Category = c.Category,
                Name = c.Name,
                Description = c.Description,
                Weight = c.Weight,
                Score = c.Score,
                WeightedScore = c.WeightedScore,
                Evidence = c.Evidence,
                Notes = c.Notes
            }).ToList()
        };
    }
}

public record RejectEvaluationRequest(string Reason);

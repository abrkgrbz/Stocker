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
public class PurchaseBudgetsController : ControllerBase
{
    private readonly PurchaseDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public PurchaseBudgetsController(
        PurchaseDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBudgets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] PurchaseBudgetStatus? status = null,
        [FromQuery] int? year = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = _context.PurchaseBudgets.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(b => b.Code.Contains(searchTerm) || b.Name.Contains(searchTerm));

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        if (year.HasValue)
            query = query.Where(b => b.Year == year.Value);

        if (departmentId.HasValue)
            query = query.Where(b => b.DepartmentId == departmentId.Value);

        query = sortBy?.ToLower() switch
        {
            "code" => sortDescending ? query.OrderByDescending(b => b.Code) : query.OrderBy(b => b.Code),
            "name" => sortDescending ? query.OrderByDescending(b => b.Name) : query.OrderBy(b => b.Name),
            "year" => sortDescending ? query.OrderByDescending(b => b.Year) : query.OrderBy(b => b.Year),
            "allocated" => sortDescending ? query.OrderByDescending(b => b.AllocatedAmount) : query.OrderBy(b => b.AllocatedAmount),
            _ => sortDescending ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(b => new PurchaseBudgetListDto
            {
                Id = b.Id,
                Code = b.Code,
                Name = b.Name,
                Status = b.Status.ToString(),
                PeriodType = b.PeriodType.ToString(),
                Year = b.Year,
                Quarter = b.Quarter,
                DepartmentName = b.DepartmentName,
                CategoryName = b.CategoryName,
                AllocatedAmount = b.AllocatedAmount,
                SpentAmount = b.SpentAmount,
                AvailableAmount = b.AvailableAmount,
                UtilizationPercentage = b.AllocatedAmount > 0 ? (b.SpentAmount + b.CommittedAmount) / b.AllocatedAmount * 100 : 0,
                AlertLevel = b.CriticalThreshold.HasValue && (b.SpentAmount + b.CommittedAmount) / b.AllocatedAmount * 100 >= b.CriticalThreshold.Value ? "Critical" :
                             b.WarningThreshold.HasValue && (b.SpentAmount + b.CommittedAmount) / b.AllocatedAmount * 100 >= b.WarningThreshold.Value ? "Warning" : "Normal",
                Currency = b.Currency,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBudget(Guid id)
    {
        var budget = await _context.PurchaseBudgets
            .Include(b => b.Revisions)
            .Include(b => b.Transactions.OrderByDescending(t => t.TransactionDate).Take(20))
            .FirstOrDefaultAsync(b => b.Id == id);

        if (budget == null)
            return NotFound("Budget not found");

        return Ok(MapToDto(budget));
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveBudgets([FromQuery] Guid? departmentId = null, [FromQuery] Guid? categoryId = null)
    {
        var query = _context.PurchaseBudgets
            .Where(b => b.Status == PurchaseBudgetStatus.Active && DateTime.Today >= b.StartDate && DateTime.Today <= b.EndDate)
            .AsQueryable();

        if (departmentId.HasValue)
            query = query.Where(b => b.DepartmentId == departmentId.Value);

        if (categoryId.HasValue)
            query = query.Where(b => b.CategoryId == categoryId.Value);

        var budgets = await query.Select(b => new PurchaseBudgetListDto
        {
            Id = b.Id,
            Code = b.Code,
            Name = b.Name,
            Status = b.Status.ToString(),
            PeriodType = b.PeriodType.ToString(),
            Year = b.Year,
            Quarter = b.Quarter,
            DepartmentName = b.DepartmentName,
            CategoryName = b.CategoryName,
            AllocatedAmount = b.AllocatedAmount,
            SpentAmount = b.SpentAmount,
            AvailableAmount = b.AvailableAmount,
            UtilizationPercentage = b.GetUtilizationPercentage(),
            AlertLevel = b.GetAlertLevel().ToString(),
            Currency = b.Currency,
            CreatedAt = b.CreatedAt
        }).ToListAsync();

        return Ok(budgets);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int? year = null)
    {
        var query = _context.PurchaseBudgets.AsQueryable();
        if (year.HasValue)
            query = query.Where(b => b.Year == year.Value);

        var budgets = await query.ToListAsync();

        var totalAllocated = budgets.Sum(b => b.AllocatedAmount);

        return Ok(new PurchaseBudgetSummaryDto
        {
            TotalBudgets = budgets.Count,
            ActiveBudgets = budgets.Count(b => b.Status == PurchaseBudgetStatus.Active),
            BudgetsAtWarning = budgets.Count(b => b.GetAlertLevel() == BudgetAlertLevel.Warning),
            BudgetsAtCritical = budgets.Count(b => b.GetAlertLevel() == BudgetAlertLevel.Critical),
            BudgetsExceeded = budgets.Count(b => b.AvailableAmount < 0),
            TotalAllocated = totalAllocated,
            TotalCommitted = budgets.Sum(b => b.CommittedAmount),
            TotalSpent = budgets.Sum(b => b.SpentAmount),
            TotalAvailable = budgets.Sum(b => b.AvailableAmount),
            OverallUtilization = totalAllocated > 0 ? budgets.Sum(b => b.SpentAmount + b.CommittedAmount) / totalAllocated * 100 : 0,
            AllocationByDepartment = budgets.Where(b => b.DepartmentName != null).GroupBy(b => b.DepartmentName!).ToDictionary(g => g.Key, g => g.Sum(b => b.AllocatedAmount)),
            SpendingByCategory = budgets.Where(b => b.CategoryName != null).GroupBy(b => b.CategoryName!).ToDictionary(g => g.Key, g => g.Sum(b => b.SpentAmount)),
            BudgetsByStatus = budgets.GroupBy(b => b.Status.ToString()).ToDictionary(g => g.Key, g => g.Count())
        });
    }

    [HttpPost("check")]
    public async Task<IActionResult> CheckBudget([FromBody] BudgetCheckRequestDto request)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(request.BudgetId);
        if (budget == null)
            return NotFound("Budget not found");

        var result = budget.CheckBudget(request.Amount);

        return Ok(new BudgetCheckResultDto
        {
            IsAllowed = result.IsAllowed,
            Status = result.Status.ToString(),
            Message = result.Message,
            AvailableAmount = budget.AvailableAmount,
            CurrentUtilization = budget.GetUtilizationPercentage(),
            ProjectedUtilization = budget.AllocatedAmount > 0 ? (budget.SpentAmount + budget.CommittedAmount + request.Amount) / budget.AllocatedAmount * 100 : 0
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] CreatePurchaseBudgetDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var budget = PurchaseBudget.Create(dto.Code, dto.Name, dto.Year, dto.StartDate, dto.EndDate, dto.AllocatedAmount, tenantId.Value, dto.PeriodType, dto.Currency, dto.Quarter, dto.Month);

        budget.Update(dto.Name, dto.Description, dto.AllocatedAmount, dto.WarningThreshold, dto.CriticalThreshold, dto.AlertOnWarning, dto.AlertOnCritical, dto.BlockOnExceed, dto.Notes, dto.InternalNotes);

        if (dto.DepartmentId.HasValue)
            budget.SetDepartment(dto.DepartmentId, dto.DepartmentName);

        if (!string.IsNullOrEmpty(dto.CostCenterCode))
            budget.SetCostCenter(dto.CostCenterCode, dto.CostCenterName);

        if (dto.CategoryId.HasValue)
            budget.SetCategory(dto.CategoryId, dto.CategoryName);

        if (dto.ParentBudgetId.HasValue)
            budget.SetParentBudget(dto.ParentBudgetId, dto.ParentBudgetCode);

        var currentUser = _currentUserService.GetCurrentUser();
        if (currentUser != null)
            budget.SetCreator(currentUser.Id, currentUser.Name ?? currentUser.Email);

        _context.PurchaseBudgets.Add(budget);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, MapToDto(budget));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBudget(Guid id, [FromBody] UpdatePurchaseBudgetDto dto)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.Update(
            dto.Name ?? budget.Name,
            dto.Description ?? budget.Description,
            dto.AllocatedAmount ?? budget.AllocatedAmount,
            dto.WarningThreshold ?? budget.WarningThreshold,
            dto.CriticalThreshold ?? budget.CriticalThreshold,
            dto.AlertOnWarning ?? budget.AlertOnWarning,
            dto.AlertOnCritical ?? budget.AlertOnCritical,
            dto.BlockOnExceed ?? budget.BlockOnExceed,
            dto.Notes ?? budget.Notes,
            dto.InternalNotes ?? budget.InternalNotes);

        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.Submit();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        var currentUser = _currentUserService.GetCurrentUser();
        budget.Approve(currentUser?.Id ?? Guid.Empty, currentUser?.Name ?? "System");
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectBudgetRequest request)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.Reject(request.Reason);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.Activate();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/freeze")]
    public async Task<IActionResult> Freeze(Guid id)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.Freeze();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.Close();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/revise")]
    public async Task<IActionResult> Revise(Guid id, [FromBody] ReviseBudgetDto dto)
    {
        var budget = await _context.PurchaseBudgets.Include(b => b.Revisions).FirstOrDefaultAsync(b => b.Id == id);
        if (budget == null)
            return NotFound("Budget not found");

        var currentUser = _currentUserService.GetCurrentUser();
        budget.ReviseBudget(dto.NewAmount, dto.Reason, currentUser?.Id ?? Guid.Empty, currentUser?.Name ?? "System");
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/commit")]
    public async Task<IActionResult> Commit(Guid id, [FromBody] CommitBudgetDto dto)
    {
        var budget = await _context.PurchaseBudgets.Include(b => b.Transactions).FirstOrDefaultAsync(b => b.Id == id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.CommitAmount(dto.Amount, dto.Reference, dto.Description, dto.ReferenceId);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/spend")]
    public async Task<IActionResult> Spend(Guid id, [FromBody] SpendBudgetDto dto)
    {
        var budget = await _context.PurchaseBudgets.Include(b => b.Transactions).FirstOrDefaultAsync(b => b.Id == id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.SpendAmount(dto.Amount, dto.Reference, dto.Description, dto.ReferenceId);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpPost("{id:guid}/release")]
    public async Task<IActionResult> Release(Guid id, [FromBody] ReleaseBudgetDto dto)
    {
        var budget = await _context.PurchaseBudgets.Include(b => b.Transactions).FirstOrDefaultAsync(b => b.Id == id);
        if (budget == null)
            return NotFound("Budget not found");

        budget.ReleaseCommitment(dto.Amount, dto.Reference, dto.Description, dto.ReferenceId);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(budget));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var budget = await _context.PurchaseBudgets.FindAsync(id);
        if (budget == null)
            return NotFound("Budget not found");

        if (budget.Status != PurchaseBudgetStatus.Draft)
            return BadRequest("Only draft budgets can be deleted");

        _context.PurchaseBudgets.Remove(budget);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static PurchaseBudgetDto MapToDto(PurchaseBudget b)
    {
        return new PurchaseBudgetDto
        {
            Id = b.Id,
            Code = b.Code,
            Name = b.Name,
            Description = b.Description,
            Status = b.Status.ToString(),
            PeriodType = b.PeriodType.ToString(),
            Year = b.Year,
            Quarter = b.Quarter,
            Month = b.Month,
            StartDate = b.StartDate,
            EndDate = b.EndDate,
            DepartmentId = b.DepartmentId,
            DepartmentName = b.DepartmentName,
            CostCenterCode = b.CostCenterCode,
            CostCenterName = b.CostCenterName,
            CategoryId = b.CategoryId,
            CategoryName = b.CategoryName,
            AllocatedAmount = b.AllocatedAmount,
            CommittedAmount = b.CommittedAmount,
            SpentAmount = b.SpentAmount,
            RemainingAmount = b.RemainingAmount,
            AvailableAmount = b.AvailableAmount,
            Currency = b.Currency,
            WarningThreshold = b.WarningThreshold,
            CriticalThreshold = b.CriticalThreshold,
            AlertOnWarning = b.AlertOnWarning,
            AlertOnCritical = b.AlertOnCritical,
            BlockOnExceed = b.BlockOnExceed,
            ParentBudgetId = b.ParentBudgetId,
            ParentBudgetCode = b.ParentBudgetCode,
            Notes = b.Notes,
            InternalNotes = b.InternalNotes,
            CreatedById = b.CreatedById,
            CreatedByName = b.CreatedByName,
            ApprovedById = b.ApprovedById,
            ApprovedByName = b.ApprovedByName,
            ApprovalDate = b.ApprovalDate,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            UtilizationPercentage = b.GetUtilizationPercentage(),
            AlertLevel = b.GetAlertLevel().ToString(),
            Revisions = b.Revisions.Select(r => new PurchaseBudgetRevisionDto
            {
                Id = r.Id,
                BudgetId = r.BudgetId,
                PreviousAmount = r.PreviousAmount,
                NewAmount = r.NewAmount,
                ChangeAmount = r.ChangeAmount,
                Reason = r.Reason,
                RevisedById = r.RevisedById,
                RevisedByName = r.RevisedByName,
                RevisedAt = r.RevisedAt
            }).ToList(),
            RecentTransactions = b.Transactions.Select(t => new PurchaseBudgetTransactionDto
            {
                Id = t.Id,
                BudgetId = t.BudgetId,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                Reference = t.Reference,
                Description = t.Description,
                ReferenceId = t.ReferenceId,
                TransactionDate = t.TransactionDate
            }).ToList()
        };
    }
}

public record RejectBudgetRequest(string Reason);

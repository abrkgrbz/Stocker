using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.ValueObjects;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Application.Segmentation;

/// <summary>
/// Engine for evaluating segment criteria and finding matching customers
/// </summary>
public class SegmentCriteriaEngine
{
    private readonly CRMDbContext _context;

    public SegmentCriteriaEngine(CRMDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Evaluates criteria and returns matching customer IDs
    /// </summary>
    public async Task<IEnumerable<Guid>> EvaluateCriteriaAsync(
        string criteriaJson,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(criteriaJson))
            return Enumerable.Empty<Guid>();

        var criteria = JsonSerializer.Deserialize<SegmentCriteria>(criteriaJson);
        if (criteria == null || !criteria.Conditions.Any())
            return Enumerable.Empty<Guid>();

        var query = _context.Customers
            .Where(c => c.TenantId == tenantId && c.IsActive)
            .AsQueryable();

        query = ApplyCriteria(query, criteria);

        return await query.Select(c => c.Id).ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Applies criteria to customer query
    /// </summary>
    private IQueryable<Customer> ApplyCriteria(
        IQueryable<Customer> query,
        SegmentCriteria criteria)
    {
        if (criteria.Operator.ToUpperInvariant() == "AND")
        {
            // AND logic - all conditions must match
            foreach (var condition in criteria.Conditions)
            {
                query = ApplyCondition(query, condition);
            }
        }
        else if (criteria.Operator.ToUpperInvariant() == "OR")
        {
            // OR logic - at least one condition must match
            var predicates = criteria.Conditions
                .Select(BuildPredicate)
                .Where(p => p != null)
                .ToList();

            if (predicates.Any())
            {
                query = query.Where(customer =>
                    predicates.Any(predicate => predicate!(customer)));
            }
        }

        return query;
    }

    /// <summary>
    /// Applies a single condition to the query
    /// </summary>
    private IQueryable<Customer> ApplyCondition(
        IQueryable<Customer> query,
        SegmentCondition condition)
    {
        var field = condition.Field.ToLowerInvariant();
        var op = condition.Operator.ToUpperInvariant();

        switch (field)
        {
            case "annualrevenue":
                return ApplyDecimalCondition(query, c => c.AnnualRevenue, op, condition.Value);

            case "numberofemployees":
                return ApplyIntCondition(query, c => c.NumberOfEmployees, op, condition.Value);

            case "industry":
                return ApplyStringCondition(query, c => c.Industry, op, condition.Value);

            case "city":
                return ApplyStringCondition(query, c => c.City, op, condition.Value);

            case "state":
                return ApplyStringCondition(query, c => c.State, op, condition.Value);

            case "country":
                return ApplyStringCondition(query, c => c.Country, op, condition.Value);

            case "companyname":
                return ApplyStringCondition(query, c => c.CompanyName, op, condition.Value);

            case "email":
                return ApplyStringCondition(query, c => c.Email, op, condition.Value);

            case "createdat":
                return ApplyDateCondition(query, c => c.CreatedAt, op, condition.Value);

            default:
                return query;
        }
    }

    /// <summary>
    /// Builds a predicate function for OR logic
    /// </summary>
    private Func<Customer, bool>? BuildPredicate(SegmentCondition condition)
    {
        var field = condition.Field.ToLowerInvariant();
        var op = condition.Operator.ToUpperInvariant();

        switch (field)
        {
            case "annualrevenue":
                return c => EvaluateDecimal(c.AnnualRevenue, op, condition.Value);

            case "numberofemployees":
                return c => EvaluateInt(c.NumberOfEmployees, op, condition.Value);

            case "industry":
                return c => EvaluateString(c.Industry, op, condition.Value);

            case "city":
                return c => EvaluateString(c.City, op, condition.Value);

            case "state":
                return c => EvaluateString(c.State, op, condition.Value);

            case "country":
                return c => EvaluateString(c.Country, op, condition.Value);

            case "companyname":
                return c => EvaluateString(c.CompanyName, op, condition.Value);

            case "email":
                return c => EvaluateString(c.Email, op, condition.Value);

            case "createdat":
                return c => EvaluateDate(c.CreatedAt, op, condition.Value);

            default:
                return null;
        }
    }

    // Decimal field conditions
    private IQueryable<Customer> ApplyDecimalCondition(
        IQueryable<Customer> query,
        Func<Customer, decimal?> selector,
        string op,
        object? value)
    {
        if (value == null) return query;

        var decimalValue = Convert.ToDecimal(value);

        return op switch
        {
            ">" => query.Where(c => selector(c) != null && selector(c)!.Value > decimalValue),
            ">=" => query.Where(c => selector(c) != null && selector(c)!.Value >= decimalValue),
            "<" => query.Where(c => selector(c) != null && selector(c)!.Value < decimalValue),
            "<=" => query.Where(c => selector(c) != null && selector(c)!.Value <= decimalValue),
            "=" => query.Where(c => selector(c) != null && selector(c)!.Value == decimalValue),
            "!=" => query.Where(c => selector(c) == null || selector(c)!.Value != decimalValue),
            _ => query
        };
    }

    private bool EvaluateDecimal(decimal? fieldValue, string op, object? conditionValue)
    {
        if (conditionValue == null) return false;
        var decimalValue = Convert.ToDecimal(conditionValue);

        return op switch
        {
            ">" => fieldValue != null && fieldValue.Value > decimalValue,
            ">=" => fieldValue != null && fieldValue.Value >= decimalValue,
            "<" => fieldValue != null && fieldValue.Value < decimalValue,
            "<=" => fieldValue != null && fieldValue.Value <= decimalValue,
            "=" => fieldValue != null && fieldValue.Value == decimalValue,
            "!=" => fieldValue == null || fieldValue.Value != decimalValue,
            _ => false
        };
    }

    // Integer field conditions
    private IQueryable<Customer> ApplyIntCondition(
        IQueryable<Customer> query,
        Func<Customer, int?> selector,
        string op,
        object? value)
    {
        if (value == null) return query;

        var intValue = Convert.ToInt32(value);

        return op switch
        {
            ">" => query.Where(c => selector(c) != null && selector(c)!.Value > intValue),
            ">=" => query.Where(c => selector(c) != null && selector(c)!.Value >= intValue),
            "<" => query.Where(c => selector(c) != null && selector(c)!.Value < intValue),
            "<=" => query.Where(c => selector(c) != null && selector(c)!.Value <= intValue),
            "=" => query.Where(c => selector(c) != null && selector(c)!.Value == intValue),
            "!=" => query.Where(c => selector(c) == null || selector(c)!.Value != intValue),
            _ => query
        };
    }

    private bool EvaluateInt(int? fieldValue, string op, object? conditionValue)
    {
        if (conditionValue == null) return false;
        var intValue = Convert.ToInt32(conditionValue);

        return op switch
        {
            ">" => fieldValue != null && fieldValue.Value > intValue,
            ">=" => fieldValue != null && fieldValue.Value >= intValue,
            "<" => fieldValue != null && fieldValue.Value < intValue,
            "<=" => fieldValue != null && fieldValue.Value <= intValue,
            "=" => fieldValue != null && fieldValue.Value == intValue,
            "!=" => fieldValue == null || fieldValue.Value != intValue,
            _ => false
        };
    }

    // String field conditions
    private IQueryable<Customer> ApplyStringCondition(
        IQueryable<Customer> query,
        Func<Customer, string?> selector,
        string op,
        object? value)
    {
        if (value == null) return query;

        var stringValue = value.ToString()!;

        return op switch
        {
            "=" => query.Where(c => selector(c) != null && selector(c) == stringValue),
            "!=" => query.Where(c => selector(c) == null || selector(c) != stringValue),
            "CONTAINS" => query.Where(c => selector(c) != null && selector(c)!.Contains(stringValue)),
            "STARTS_WITH" => query.Where(c => selector(c) != null && selector(c)!.StartsWith(stringValue)),
            "ENDS_WITH" => query.Where(c => selector(c) != null && selector(c)!.EndsWith(stringValue)),
            "IN" => query.Where(c => selector(c) != null && ParseArray(value).Contains(selector(c)!)),
            "NOT_IN" => query.Where(c => selector(c) == null || !ParseArray(value).Contains(selector(c)!)),
            _ => query
        };
    }

    private bool EvaluateString(string? fieldValue, string op, object? conditionValue)
    {
        if (conditionValue == null) return false;
        var stringValue = conditionValue.ToString()!;

        return op switch
        {
            "=" => fieldValue != null && fieldValue == stringValue,
            "!=" => fieldValue == null || fieldValue != stringValue,
            "CONTAINS" => fieldValue != null && fieldValue.Contains(stringValue, StringComparison.OrdinalIgnoreCase),
            "STARTS_WITH" => fieldValue != null && fieldValue.StartsWith(stringValue, StringComparison.OrdinalIgnoreCase),
            "ENDS_WITH" => fieldValue != null && fieldValue.EndsWith(stringValue, StringComparison.OrdinalIgnoreCase),
            "IN" => fieldValue != null && ParseArray(conditionValue).Contains(fieldValue),
            "NOT_IN" => fieldValue == null || !ParseArray(conditionValue).Contains(fieldValue),
            _ => false
        };
    }

    // Date field conditions
    private IQueryable<Customer> ApplyDateCondition(
        IQueryable<Customer> query,
        Func<Customer, DateTime> selector,
        string op,
        object? value)
    {
        if (value == null) return query;

        var dateValue = Convert.ToDateTime(value);

        return op switch
        {
            ">" => query.Where(c => selector(c) > dateValue),
            ">=" => query.Where(c => selector(c) >= dateValue),
            "<" => query.Where(c => selector(c) < dateValue),
            "<=" => query.Where(c => selector(c) <= dateValue),
            "=" => query.Where(c => selector(c).Date == dateValue.Date),
            "!=" => query.Where(c => selector(c).Date != dateValue.Date),
            _ => query
        };
    }

    private bool EvaluateDate(DateTime fieldValue, string op, object? conditionValue)
    {
        if (conditionValue == null) return false;
        var dateValue = Convert.ToDateTime(conditionValue);

        return op switch
        {
            ">" => fieldValue > dateValue,
            ">=" => fieldValue >= dateValue,
            "<" => fieldValue < dateValue,
            "<=" => fieldValue <= dateValue,
            "=" => fieldValue.Date == dateValue.Date,
            "!=" => fieldValue.Date != dateValue.Date,
            _ => false
        };
    }

    // Helper to parse array values for IN/NOT_IN operators
    private List<string> ParseArray(object value)
    {
        if (value is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Array)
        {
            return jsonElement.EnumerateArray()
                .Select(e => e.GetString() ?? string.Empty)
                .ToList();
        }

        if (value is string str)
        {
            try
            {
                var array = JsonSerializer.Deserialize<List<string>>(str);
                return array ?? new List<string>();
            }
            catch
            {
                // If not valid JSON, treat as single value
                return new List<string> { str };
            }
        }

        return new List<string>();
    }
}

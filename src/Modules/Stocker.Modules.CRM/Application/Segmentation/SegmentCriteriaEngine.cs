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

        // Direct LINQ expressions for EF Core compatibility
        switch (field)
        {
            case "annualrevenue":
                if (condition.Value == null) return query;
                var decimalValue = Convert.ToDecimal(condition.Value);
                return op switch
                {
                    ">" => query.Where(c => c.AnnualRevenue != null && c.AnnualRevenue > decimalValue),
                    ">=" => query.Where(c => c.AnnualRevenue != null && c.AnnualRevenue >= decimalValue),
                    "<" => query.Where(c => c.AnnualRevenue != null && c.AnnualRevenue < decimalValue),
                    "<=" => query.Where(c => c.AnnualRevenue != null && c.AnnualRevenue <= decimalValue),
                    "=" => query.Where(c => c.AnnualRevenue != null && c.AnnualRevenue == decimalValue),
                    "!=" => query.Where(c => c.AnnualRevenue == null || c.AnnualRevenue != decimalValue),
                    _ => query
                };

            case "numberofemployees":
                if (condition.Value == null) return query;
                var intValue = Convert.ToInt32(condition.Value);
                return op switch
                {
                    ">" => query.Where(c => c.NumberOfEmployees != null && c.NumberOfEmployees > intValue),
                    ">=" => query.Where(c => c.NumberOfEmployees != null && c.NumberOfEmployees >= intValue),
                    "<" => query.Where(c => c.NumberOfEmployees != null && c.NumberOfEmployees < intValue),
                    "<=" => query.Where(c => c.NumberOfEmployees != null && c.NumberOfEmployees <= intValue),
                    "=" => query.Where(c => c.NumberOfEmployees != null && c.NumberOfEmployees == intValue),
                    "!=" => query.Where(c => c.NumberOfEmployees == null || c.NumberOfEmployees != intValue),
                    _ => query
                };

            case "industry":
                if (condition.Value == null) return query;
                var industryValue = condition.Value.ToString()!;
                return op switch
                {
                    "=" => query.Where(c => c.Industry != null && c.Industry == industryValue),
                    "!=" => query.Where(c => c.Industry == null || c.Industry != industryValue),
                    "CONTAINS" => query.Where(c => c.Industry != null && c.Industry.Contains(industryValue)),
                    _ => query
                };

            case "city":
                if (condition.Value == null) return query;
                var cityValue = condition.Value.ToString()!;
                return op switch
                {
                    "=" => query.Where(c => c.City != null && c.City == cityValue),
                    "!=" => query.Where(c => c.City == null || c.City != cityValue),
                    "CONTAINS" => query.Where(c => c.City != null && c.City.Contains(cityValue)),
                    _ => query
                };

            case "state":
                if (condition.Value == null) return query;
                var stateValue = condition.Value.ToString()!;
                return op switch
                {
                    "=" => query.Where(c => c.State != null && c.State == stateValue),
                    "!=" => query.Where(c => c.State == null || c.State != stateValue),
                    "CONTAINS" => query.Where(c => c.State != null && c.State.Contains(stateValue)),
                    _ => query
                };

            case "country":
                if (condition.Value == null) return query;
                var countryValue = condition.Value.ToString()!;
                return op switch
                {
                    "=" => query.Where(c => c.Country != null && c.Country == countryValue),
                    "!=" => query.Where(c => c.Country == null || c.Country != countryValue),
                    "CONTAINS" => query.Where(c => c.Country != null && c.Country.Contains(countryValue)),
                    _ => query
                };

            case "companyname":
                if (condition.Value == null) return query;
                var companyValue = condition.Value.ToString()!;
                return op switch
                {
                    "=" => query.Where(c => c.CompanyName != null && c.CompanyName == companyValue),
                    "!=" => query.Where(c => c.CompanyName == null || c.CompanyName != companyValue),
                    "CONTAINS" => query.Where(c => c.CompanyName != null && c.CompanyName.Contains(companyValue)),
                    _ => query
                };

            case "email":
                if (condition.Value == null) return query;
                var emailValue = condition.Value.ToString()!;
                return op switch
                {
                    "=" => query.Where(c => c.Email != null && c.Email == emailValue),
                    "!=" => query.Where(c => c.Email == null || c.Email != emailValue),
                    "CONTAINS" => query.Where(c => c.Email != null && c.Email.Contains(emailValue)),
                    _ => query
                };

            case "createdat":
                if (condition.Value == null) return query;
                var dateValue = Convert.ToDateTime(condition.Value);
                return op switch
                {
                    ">" => query.Where(c => c.CreatedAt > dateValue),
                    ">=" => query.Where(c => c.CreatedAt >= dateValue),
                    "<" => query.Where(c => c.CreatedAt < dateValue),
                    "<=" => query.Where(c => c.CreatedAt <= dateValue),
                    "=" => query.Where(c => c.CreatedAt.Date == dateValue.Date),
                    "!=" => query.Where(c => c.CreatedAt.Date != dateValue.Date),
                    _ => query
                };

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

    // Evaluation helpers for OR logic (in-memory)
    private static bool EvaluateDecimal(decimal? fieldValue, string op, object? conditionValue)
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

    private static bool EvaluateInt(int? fieldValue, string op, object? conditionValue)
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

    private static bool EvaluateString(string? fieldValue, string op, object? conditionValue)
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

    private static bool EvaluateDate(DateTime fieldValue, string op, object? conditionValue)
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
    private static List<string> ParseArray(object value)
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

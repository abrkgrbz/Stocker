namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when a business rule is violated
/// </summary>
public class BusinessRuleException : BusinessException
{
    public BusinessRuleException(string message, string? code = null) 
        : base(code ?? "BUSINESS_RULE", message)
    {
    }
}
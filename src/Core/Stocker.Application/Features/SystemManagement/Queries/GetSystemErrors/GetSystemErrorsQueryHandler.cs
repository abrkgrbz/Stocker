using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Queries.GetSystemErrors;

public class GetSystemErrorsQueryHandler : IRequestHandler<GetSystemErrorsQuery, Result<List<SystemErrorDto>>>
{
    public async Task<Result<List<SystemErrorDto>>> Handle(GetSystemErrorsQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement actual error retrieval from logging system or database
        // For now, return mock data for UI testing
        var errors = new List<SystemErrorDto>
        {
            new SystemErrorDto
            {
                Id = Guid.NewGuid().ToString(),
                Message = "Database connection timeout",
                Source = "Stocker.Persistence",
                Severity = "Error",
                Timestamp = DateTime.UtcNow.AddHours(-2),
                IsResolved = false,
                Metadata = new Dictionary<string, object>
                {
                    { "ConnectionString", "Server=localhost;Database=..." },
                    { "Timeout", 30 }
                }
            },
            new SystemErrorDto
            {
                Id = Guid.NewGuid().ToString(),
                Message = "Null reference exception in payment processing",
                StackTrace = "at Stocker.Application.Features.Payments.ProcessPaymentCommand.Handle(...)",
                Source = "Stocker.Application",
                Severity = "Critical",
                Timestamp = DateTime.UtcNow.AddHours(-4),
                IsResolved = true,
                Resolution = "Fixed null check in payment handler",
                ResolvedAt = DateTime.UtcNow.AddHours(-3),
                Metadata = new Dictionary<string, object>
                {
                    { "TenantId", "tenant-123" },
                    { "PaymentId", "pay-456" }
                }
            }
        };

        return Result<List<SystemErrorDto>>.Success(errors);
    }
}

using Stocker.Application.DTOs.Security;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogById;

/// <summary>
/// Query for retrieving a single audit log by ID
/// </summary>
public class GetAuditLogByIdQuery : IRequest<Result<SecurityAuditLogDto>>
{
    public Guid Id { get; set; }

    public GetAuditLogByIdQuery(Guid id)
    {
        Id = id;
    }
}

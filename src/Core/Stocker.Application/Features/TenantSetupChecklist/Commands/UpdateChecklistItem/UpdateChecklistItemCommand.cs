using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupChecklist.Commands.UpdateChecklistItem;

public sealed class UpdateChecklistItemCommand : IRequest<Result<TenantSetupChecklistDto>>
{
    public Guid ChecklistId { get; set; }
    public string ItemKey { get; set; } = string.Empty;
    public bool? IsCompleted { get; set; }
    public string? CompletedBy { get; set; }
    public Dictionary<string, object>? ItemData { get; set; }
}
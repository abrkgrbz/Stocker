using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Commands.UpdateDocItem;

public class UpdateDocItemCommand : IRequest<Result<DocItemDto>>
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Content { get; set; }
    public Guid? ParentId { get; set; }
    public int? Order { get; set; }
    public string? Icon { get; set; }
}

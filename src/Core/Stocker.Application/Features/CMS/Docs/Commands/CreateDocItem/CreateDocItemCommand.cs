using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Commands.CreateDocItem;

public class CreateDocItemCommand : IRequest<Result<DocItemDto>>
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public DocItemType Type { get; set; }
    public Guid? ParentId { get; set; }
    public string? Content { get; set; }
    public int Order { get; set; } = 0;
    public string? Icon { get; set; }
    public Guid? AuthorId { get; set; }
}

using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.EmailTemplate;

namespace Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplatesList;

public class GetEmailTemplatesListQuery : IRequest<Result<EmailTemplateListDto>>
{
    public string? Category { get; set; }
    public string? Language { get; set; }
    public bool? IsActive { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

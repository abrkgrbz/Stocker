using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.EmailTemplate;

namespace Stocker.Application.Features.EmailTemplates.Queries.PreviewEmailTemplate;

public class PreviewEmailTemplateQuery : IRequest<Result<EmailTemplatePreviewDto>>
{
    public Guid Id { get; set; }
    public string? SampleData { get; set; }
}

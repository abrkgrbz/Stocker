using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.EmailTemplate;

namespace Stocker.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;

public class UpdateEmailTemplateCommand : IRequest<Result<EmailTemplateDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
    public List<string>? Variables { get; set; }
    public string? SampleData { get; set; }
    public string? UpdatedBy { get; set; }
}

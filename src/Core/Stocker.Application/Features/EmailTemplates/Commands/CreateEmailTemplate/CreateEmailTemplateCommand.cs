using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.EmailTemplate;

namespace Stocker.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;

public class CreateEmailTemplateCommand : IRequest<Result<EmailTemplateDto>>
{
    public string TemplateKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
    public string Language { get; set; } = "tr";
    public string Category { get; set; } = "Authentication";
    public List<string> Variables { get; set; } = new();
    public string? SampleData { get; set; }
    public string? CreatedBy { get; set; }
}

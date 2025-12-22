using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.EmailTemplate;

namespace Stocker.Application.Features.EmailTemplates.Queries.ValidateEmailTemplate;

public class ValidateEmailTemplateQuery : IRequest<Result<EmailTemplateValidationDto>>
{
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
}

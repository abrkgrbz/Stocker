using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Queries.ValidateEmailTemplate;

public class ValidateEmailTemplateQueryHandler : IRequestHandler<ValidateEmailTemplateQuery, Result<EmailTemplateValidationDto>>
{
    private readonly ILiquidTemplateService _liquidTemplateService;

    public ValidateEmailTemplateQueryHandler(ILiquidTemplateService liquidTemplateService)
    {
        _liquidTemplateService = liquidTemplateService;
    }

    public Task<Result<EmailTemplateValidationDto>> Handle(ValidateEmailTemplateQuery request, CancellationToken cancellationToken)
    {
        var errors = new List<string>();
        var allVariables = new HashSet<string>();

        // Validate subject
        var subjectValidation = _liquidTemplateService.ValidateTemplate(request.Subject);
        if (!subjectValidation.IsValid)
        {
            errors.AddRange(subjectValidation.Errors.Select(e => $"Subject: {e}"));
        }
        else
        {
            var subjectVars = _liquidTemplateService.ExtractVariables(request.Subject);
            foreach (var v in subjectVars) allVariables.Add(v);
        }

        // Validate HTML body
        var bodyValidation = _liquidTemplateService.ValidateTemplate(request.HtmlBody);
        if (!bodyValidation.IsValid)
        {
            errors.AddRange(bodyValidation.Errors.Select(e => $"HTML Body: {e}"));
        }
        else
        {
            var bodyVars = _liquidTemplateService.ExtractVariables(request.HtmlBody);
            foreach (var v in bodyVars) allVariables.Add(v);
        }

        // Validate plain text body if provided
        if (!string.IsNullOrEmpty(request.PlainTextBody))
        {
            var plainTextValidation = _liquidTemplateService.ValidateTemplate(request.PlainTextBody);
            if (!plainTextValidation.IsValid)
            {
                errors.AddRange(plainTextValidation.Errors.Select(e => $"Plain Text Body: {e}"));
            }
            else
            {
                var plainTextVars = _liquidTemplateService.ExtractVariables(request.PlainTextBody);
                foreach (var v in plainTextVars) allVariables.Add(v);
            }
        }

        var result = new EmailTemplateValidationDto
        {
            IsValid = errors.Count == 0,
            Errors = errors,
            ExtractedVariables = allVariables.OrderBy(v => v).ToList()
        };

        return Task.FromResult(Result<EmailTemplateValidationDto>.Success(result));
    }
}

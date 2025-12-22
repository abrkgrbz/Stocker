using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Commands.DeleteEmailTemplate;

public class DeleteEmailTemplateCommandHandler : IRequestHandler<DeleteEmailTemplateCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<DeleteEmailTemplateCommandHandler> _logger;

    public DeleteEmailTemplateCommandHandler(
        IMasterDbContext context,
        ILogger<DeleteEmailTemplateCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteEmailTemplateCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var template = await _context.EmailTemplates
                .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            if (template == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("EmailTemplate.NotFound", $"Email template with ID '{request.Id}' not found"));
            }

            // System templates cannot be deleted
            if (template.IsSystem)
            {
                return Result<bool>.Failure(
                    Error.Validation("EmailTemplate.SystemTemplate", "System templates cannot be deleted"));
            }

            _context.EmailTemplates.Remove(template);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email template '{TemplateKey}' (ID: {TemplateId}) deleted",
                template.TemplateKey, template.Id);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting email template {TemplateId}", request.Id);
            return Result<bool>.Failure(
                Error.Failure("EmailTemplate.DeleteFailed", "Failed to delete email template"));
        }
    }
}

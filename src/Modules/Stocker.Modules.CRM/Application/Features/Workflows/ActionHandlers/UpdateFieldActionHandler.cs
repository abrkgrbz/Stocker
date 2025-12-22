using System.Text.Json;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;

/// <summary>
/// Handles UpdateField workflow actions to modify entity properties
/// Currently supports limited field updates - can be extended as needed
/// </summary>
public class UpdateFieldActionHandler : IWorkflowActionHandler
{
    private readonly ICRMUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateFieldActionHandler> _logger;

    public UpdateFieldActionHandler(
        ICRMUnitOfWork unitOfWork,
        ILogger<UpdateFieldActionHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public bool CanHandle(string actionType)
    {
        return actionType == WorkflowActionType.UpdateField.ToString() ||
               actionType == nameof(WorkflowActionType.UpdateField);
    }

    public async Task<Result<WorkflowActionResult>> ExecuteAsync(
        WorkflowActionContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = ParseConfiguration(context.ActionConfiguration);

            if (string.IsNullOrEmpty(config.FieldName))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("UpdateField", "Field name is required"));
            }

            if (config.FieldValue == null)
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("UpdateField", "Field value is required"));
            }

            // Get entity type and ID from context
            var entityType = config.EntityType ?? context.EntityType;
            var entityId = config.EntityId ?? context.EntityId;

            if (string.IsNullOrEmpty(entityType) || string.IsNullOrEmpty(entityId))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("UpdateField", "Entity type and ID are required"));
            }

            // Replace variables in field value
            var fieldValue = ReplaceVariables(config.FieldValue.ToString() ?? string.Empty, context);

            // Update the entity based on type
            var updateResult = entityType.ToLowerInvariant() switch
            {
                "lead" => await UpdateLeadFieldAsync(entityId, config.FieldName, fieldValue, cancellationToken),
                "contact" => await UpdateContactFieldAsync(entityId, config.FieldName, fieldValue, cancellationToken),
                _ => Result.Failure(Error.Validation("UpdateField", $"Unsupported entity type for field update: {entityType}. Currently supports: Lead, Contact"))
            };

            if (!updateResult.IsSuccess)
            {
                _logger.LogError(
                    "Failed to update field for workflow {WorkflowId}, execution {ExecutionId}: {Error}",
                    context.WorkflowId, context.ExecutionId, updateResult.Error?.Description);

                return Result<WorkflowActionResult>.Failure(
                    updateResult.Error ?? Error.Failure("UpdateField", "Failed to update field"));
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Field updated successfully for workflow {WorkflowId}, execution {ExecutionId}. EntityType: {EntityType}, EntityId: {EntityId}, Field: {FieldName}",
                context.WorkflowId, context.ExecutionId, entityType, entityId, config.FieldName);

            var outputData = new Dictionary<string, object>
            {
                ["entityType"] = entityType,
                ["entityId"] = entityId,
                ["fieldName"] = config.FieldName,
                ["newValue"] = fieldValue,
                ["updatedAt"] = DateTime.UtcNow
            };

            return Result<WorkflowActionResult>.Success(
                WorkflowActionResult.Success(outputData));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error executing UpdateField action for workflow {WorkflowId}, execution {ExecutionId}",
                context.WorkflowId, context.ExecutionId);

            return Result<WorkflowActionResult>.Failure(
                Error.Failure("UpdateField", $"Failed to execute UpdateField action: {ex.Message}"));
        }
    }

    private async Task<Result> UpdateLeadFieldAsync(string entityId, string fieldName, string fieldValue, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(entityId, out var leadId))
        {
            return Result.Failure(Error.Validation("UpdateField", "Invalid lead ID"));
        }

        var lead = await _unitOfWork.Leads.GetByIdAsync(leadId, cancellationToken);
        if (lead == null)
        {
            return Result.Failure(Error.NotFound("Lead", leadId.ToString()));
        }

        // Update field based on field name
        return fieldName.ToLowerInvariant() switch
        {
            "status" => UpdateLeadStatus(lead, fieldValue),
            "rating" => UpdateLeadRating(lead, fieldValue),
            "score" => UpdateLeadScore(lead, fieldValue),
            "description" => lead.UpdateDescription(fieldValue),
            _ => Result.Failure(Error.Validation("UpdateField", $"Unsupported lead field: {fieldName}. Supported: status, rating, score, description"))
        };
    }

    private Result UpdateLeadStatus(Domain.Entities.Lead lead, string value)
    {
        if (Enum.TryParse<LeadStatus>(value, true, out var status))
        {
            return lead.UpdateStatus(status);
        }
        return Result.Failure(Error.Validation("UpdateField", $"Invalid lead status: {value}"));
    }

    private Result UpdateLeadRating(Domain.Entities.Lead lead, string value)
    {
        if (Enum.TryParse<LeadRating>(value, true, out var rating))
        {
            return lead.UpdateRating(rating);
        }
        return Result.Failure(Error.Validation("UpdateField", $"Invalid lead rating: {value}"));
    }

    private Result UpdateLeadScore(Domain.Entities.Lead lead, string value)
    {
        if (int.TryParse(value, out var score))
        {
            return lead.UpdateScore(score);
        }
        return Result.Failure(Error.Validation("UpdateField", $"Invalid lead score: {value}"));
    }

    private async Task<Result> UpdateContactFieldAsync(string entityId, string fieldName, string fieldValue, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(entityId, out var contactId))
        {
            return Result.Failure(Error.Validation("UpdateField", "Invalid contact ID"));
        }

        var contact = await _unitOfWork.Contacts.GetByIdAsync(contactId, cancellationToken);
        if (contact == null)
        {
            return Result.Failure(Error.NotFound("Contact", contactId.ToString()));
        }

        // Update field based on field name
        return fieldName.ToLowerInvariant() switch
        {
            "notes" => contact.UpdateNotes(fieldValue),
            _ => Result.Failure(Error.Validation("UpdateField", $"Unsupported contact field: {fieldName}. Supported: notes"))
        };
    }

    private UpdateFieldConfiguration ParseConfiguration(string actionConfiguration)
    {
        try
        {
            return JsonSerializer.Deserialize<UpdateFieldConfiguration>(actionConfiguration)
                ?? new UpdateFieldConfiguration();
        }
        catch
        {
            _logger.LogWarning("Failed to parse update field configuration, using defaults");
            return new UpdateFieldConfiguration();
        }
    }

    private string ReplaceVariables(string template, WorkflowActionContext context)
    {
        if (string.IsNullOrEmpty(template))
            return template;

        var result = template;

        // Replace workflow variables
        result = result.Replace("{{WorkflowId}}", context.WorkflowId.ToString());
        result = result.Replace("{{ExecutionId}}", context.ExecutionId.ToString());
        result = result.Replace("{{EntityId}}", context.EntityId.ToString());
        result = result.Replace("{{EntityType}}", context.EntityType);
        result = result.Replace("{{CurrentDate}}", DateTime.Now.ToString("yyyy-MM-dd"));
        result = result.Replace("{{CurrentTime}}", DateTime.Now.ToString("HH:mm:ss"));
        result = result.Replace("{{CurrentDateTime}}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

        // Replace trigger data variables
        if (context.TriggerData != null)
        {
            foreach (var kvp in context.TriggerData)
            {
                result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value?.ToString() ?? string.Empty);
            }
        }

        return result;
    }

    private class UpdateFieldConfiguration
    {
        public string? EntityType { get; set; }
        public string? EntityId { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public object? FieldValue { get; set; }
    }
}

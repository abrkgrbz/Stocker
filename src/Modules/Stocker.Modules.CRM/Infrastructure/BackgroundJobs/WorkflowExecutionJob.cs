using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Workflows;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire job for processing workflow executions in the background.
/// This job properly handles tenant context for multi-tenant scenarios.
/// </summary>
public class WorkflowExecutionJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WorkflowExecutionJob> _logger;

    public WorkflowExecutionJob(
        IServiceProvider serviceProvider,
        ILogger<WorkflowExecutionJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Process a workflow execution with proper tenant context.
    /// </summary>
    /// <param name="executionId">The workflow execution ID to process</param>
    /// <param name="tenantId">The tenant ID for context resolution</param>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 60, 120 })]
    public async Task ProcessExecutionAsync(int executionId, Guid tenantId)
    {
        _logger.LogInformation(
            "Starting workflow execution job. ExecutionId: {ExecutionId}, TenantId: {TenantId}",
            executionId, tenantId);

        // Create a new scope to ensure fresh DbContext instances
        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            // Set up tenant context
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();

            var tenantInfo = await tenantResolver.ResolveByIdAsync(tenantId);
            if (tenantInfo == null)
            {
                _logger.LogError(
                    "Tenant not found for workflow execution. ExecutionId: {ExecutionId}, TenantId: {TenantId}",
                    executionId, tenantId);
                throw new InvalidOperationException($"Tenant not found: {tenantId}");
            }

            if (!tenantInfo.IsActive)
            {
                _logger.LogWarning(
                    "Tenant is inactive, skipping workflow execution. ExecutionId: {ExecutionId}, TenantId: {TenantId}",
                    executionId, tenantId);
                return;
            }

            // Set tenant context for this scope
            backgroundTenantService.SetTenantInfo(
                tenantId,
                tenantInfo.Name,
                tenantInfo.ConnectionString);

            _logger.LogDebug(
                "Tenant context set for workflow execution. TenantId: {TenantId}, TenantName: {TenantName}",
                tenantId, tenantInfo.Name);

            // Get the execution service from the scoped provider (with proper tenant context)
            var executionService = scopedProvider.GetRequiredService<IWorkflowExecutionService>();

            // Process the workflow execution
            var result = await executionService.ProcessExecutionAsync(executionId, CancellationToken.None);

            if (!result.IsSuccess)
            {
                _logger.LogError(
                    "Workflow execution failed. ExecutionId: {ExecutionId}, Error: {Error}",
                    executionId, result.Error?.Description);
                throw new Exception($"Workflow execution failed: {result.Error?.Description}");
            }

            _logger.LogInformation(
                "Workflow execution completed successfully. ExecutionId: {ExecutionId}",
                executionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing workflow execution. ExecutionId: {ExecutionId}, TenantId: {TenantId}",
                executionId, tenantId);
            throw;
        }
    }
}

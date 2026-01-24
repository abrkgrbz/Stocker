using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Resilience;

/// <summary>
/// Saga step definition with execute and compensate actions.
/// </summary>
public class SagaStep
{
    public required string Name { get; init; }
    public required Func<CancellationToken, Task> Execute { get; init; }
    public required Func<CancellationToken, Task> Compensate { get; init; }
}

/// <summary>
/// Result of a saga execution.
/// </summary>
public class SagaResult
{
    public bool IsSuccess { get; init; }
    public string? FailedStep { get; init; }
    public Exception? Exception { get; init; }
    public List<string> CompletedSteps { get; init; } = new();
    public List<string> CompensatedSteps { get; init; } = new();

    public static SagaResult Success(List<string> completedSteps) => new()
    {
        IsSuccess = true,
        CompletedSteps = completedSteps
    };

    public static SagaResult Failure(string failedStep, Exception ex, List<string> completedSteps, List<string> compensatedSteps) => new()
    {
        IsSuccess = false,
        FailedStep = failedStep,
        Exception = ex,
        CompletedSteps = completedSteps,
        CompensatedSteps = compensatedSteps
    };
}

/// <summary>
/// Lightweight saga orchestrator for coordinating multi-step operations with compensation.
/// Executes steps in order and compensates (in reverse) on failure.
/// </summary>
public class SagaOrchestrator
{
    private readonly ILogger<SagaOrchestrator> _logger;
    private readonly List<SagaStep> _steps = new();
    private readonly string _sagaName;

    public SagaOrchestrator(string sagaName, ILogger<SagaOrchestrator> logger)
    {
        _sagaName = sagaName;
        _logger = logger;
    }

    /// <summary>
    /// Add a step to the saga.
    /// </summary>
    public SagaOrchestrator AddStep(string name, Func<CancellationToken, Task> execute, Func<CancellationToken, Task> compensate)
    {
        _steps.Add(new SagaStep { Name = name, Execute = execute, Compensate = compensate });
        return this;
    }

    /// <summary>
    /// Execute all saga steps. On failure, compensate completed steps in reverse order.
    /// </summary>
    public async Task<SagaResult> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var completedSteps = new List<string>();

        _logger.LogInformation("Saga '{SagaName}' started with {StepCount} steps", _sagaName, _steps.Count);

        for (int i = 0; i < _steps.Count; i++)
        {
            var step = _steps[i];

            try
            {
                _logger.LogDebug("Saga '{SagaName}' executing step '{StepName}' ({Index}/{Total})",
                    _sagaName, step.Name, i + 1, _steps.Count);

                await step.Execute(cancellationToken);
                completedSteps.Add(step.Name);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Saga '{SagaName}' failed at step '{StepName}'. Starting compensation for {CompletedCount} completed steps",
                    _sagaName, step.Name, completedSteps.Count);

                var compensatedSteps = await CompensateAsync(completedSteps, cancellationToken);

                return SagaResult.Failure(step.Name, ex, completedSteps, compensatedSteps);
            }
        }

        _logger.LogInformation("Saga '{SagaName}' completed successfully with {StepCount} steps", _sagaName, completedSteps.Count);
        return SagaResult.Success(completedSteps);
    }

    private async Task<List<string>> CompensateAsync(List<string> completedSteps, CancellationToken cancellationToken)
    {
        var compensated = new List<string>();

        // Compensate in reverse order
        for (int i = completedSteps.Count - 1; i >= 0; i--)
        {
            var stepName = completedSteps[i];
            var step = _steps.First(s => s.Name == stepName);

            try
            {
                _logger.LogDebug("Saga '{SagaName}' compensating step '{StepName}'", _sagaName, stepName);
                await step.Compensate(cancellationToken);
                compensated.Add(stepName);
            }
            catch (Exception compensateEx)
            {
                _logger.LogError(compensateEx,
                    "Saga '{SagaName}' compensation failed for step '{StepName}'. Manual intervention may be required.",
                    _sagaName, stepName);
                // Continue compensating remaining steps even if one fails
            }
        }

        _logger.LogInformation("Saga '{SagaName}' compensation completed. Compensated {Count}/{Total} steps",
            _sagaName, compensated.Count, completedSteps.Count);

        return compensated;
    }
}

/// <summary>
/// Factory for creating saga orchestrators with DI-injected logger.
/// </summary>
public class SagaOrchestratorFactory
{
    private readonly ILogger<SagaOrchestrator> _logger;

    public SagaOrchestratorFactory(ILogger<SagaOrchestrator> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Create a new saga orchestrator with the specified name.
    /// </summary>
    public SagaOrchestrator Create(string sagaName)
    {
        return new SagaOrchestrator(sagaName, _logger);
    }
}

using System.Linq.Expressions;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Mock implementation of IBackgroundJobService for testing environment
/// </summary>
public class MockBackgroundJobService : IBackgroundJobService
{
    // Fire and forget jobs
    public string Enqueue<T>(Expression<Func<T, Task>> methodCall)
    {
        // Return a fake job id for testing
        return Guid.NewGuid().ToString();
    }

    public string Enqueue<T>(Expression<Action<T>> methodCall)
    {
        // Return a fake job id for testing
        return Guid.NewGuid().ToString();
    }
    
    // Delayed jobs
    public string Schedule<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay)
    {
        // Return a fake job id for testing
        return Guid.NewGuid().ToString();
    }

    public string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay)
    {
        // Return a fake job id for testing
        return Guid.NewGuid().ToString();
    }

    public string Schedule<T>(Expression<Func<T, Task>> methodCall, DateTimeOffset enqueueAt)
    {
        // Return a fake job id for testing
        return Guid.NewGuid().ToString();
    }
    
    // Recurring jobs
    public void AddOrUpdateRecurringJob(string recurringJobId, Expression<Func<Task>> methodCall, string cronExpression)
    {
        // Do nothing for testing
    }

    public void AddOrUpdateRecurringJob<T>(string recurringJobId, Expression<Func<T, Task>> methodCall, string cronExpression)
    {
        // Do nothing for testing
    }

    public void RemoveRecurringJob(string recurringJobId)
    {
        // Do nothing for testing
    }
    
    // Continuation jobs
    public string ContinueJobWith<T>(string parentJobId, Expression<Func<T, Task>> methodCall)
    {
        // Return a fake job id for testing
        return Guid.NewGuid().ToString();
    }
    
    // Job management
    public bool Delete(string jobId)
    {
        // Always return true for testing
        return true;
    }

    public bool Requeue(string jobId)
    {
        // Always return true for testing
        return true;
    }
}
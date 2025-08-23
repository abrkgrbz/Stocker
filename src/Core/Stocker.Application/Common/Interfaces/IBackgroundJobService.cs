using System.Linq.Expressions;

namespace Stocker.Application.Common.Interfaces;

public interface IBackgroundJobService
{
    // Fire and forget jobs
    string Enqueue<T>(Expression<Func<T, Task>> methodCall);
    string Enqueue<T>(Expression<Action<T>> methodCall);
    
    // Delayed jobs
    string Schedule<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay);
    string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay);
    string Schedule<T>(Expression<Func<T, Task>> methodCall, DateTimeOffset enqueueAt);
    
    // Recurring jobs
    void AddOrUpdateRecurringJob(string recurringJobId, Expression<Func<Task>> methodCall, string cronExpression);
    void AddOrUpdateRecurringJob<T>(string recurringJobId, Expression<Func<T, Task>> methodCall, string cronExpression);
    void RemoveRecurringJob(string recurringJobId);
    
    // Continuation jobs
    string ContinueJobWith<T>(string parentJobId, Expression<Func<T, Task>> methodCall);
    
    // Job management
    bool Delete(string jobId);
    bool Requeue(string jobId);
}
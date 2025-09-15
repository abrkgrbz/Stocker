using System.Linq.Expressions;
using Stocker.Application.Common.Interfaces;

namespace Stocker.TestUtilities;

public class MockBackgroundJobService : IBackgroundJobService
{
    public string Enqueue<T>(Expression<Func<T, Task>> methodCall) => Guid.NewGuid().ToString();
    
    public string Enqueue<T>(Expression<Action<T>> methodCall) => Guid.NewGuid().ToString();
    
    public string Schedule<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay) => Guid.NewGuid().ToString();
    
    public string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay) => Guid.NewGuid().ToString();
    
    public string Schedule<T>(Expression<Func<T, Task>> methodCall, DateTimeOffset enqueueAt) => Guid.NewGuid().ToString();
    
    public void AddOrUpdateRecurringJob(string recurringJobId, Expression<Func<Task>> methodCall, string cronExpression) { }
    
    public void AddOrUpdateRecurringJob<T>(string recurringJobId, Expression<Func<T, Task>> methodCall, string cronExpression) { }
    
    public void RemoveRecurringJob(string recurringJobId) { }
    
    public string ContinueJobWith<T>(string parentJobId, Expression<Func<T, Task>> methodCall) => Guid.NewGuid().ToString();
    
    public bool Delete(string jobId) => true;
    
    public bool Requeue(string jobId) => true;
}
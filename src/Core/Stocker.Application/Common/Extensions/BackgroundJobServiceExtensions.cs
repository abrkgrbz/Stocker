using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Tenants.Commands.CreateTenantFromRegistration;
using System.Linq.Expressions;

namespace Stocker.Application.Common.Extensions;

public static class BackgroundJobServiceExtensions
{
    /// <summary>
    /// Enqueue a job with a simple job name and parameters
    /// </summary>
    public static Task<string> EnqueueAsync(
        this IBackgroundJobService backgroundJobService, 
        string jobName, 
        object parameters,
        string queueName = "default")
    {
        // Route based on job name
        switch (jobName)
        {
            case "CreateTenantFromRegistration":
                if (parameters is { RegistrationId: Guid registrationId })
                {
                    // Use MediatR to execute the command
                    var jobId = backgroundJobService.Enqueue<IMediator>(mediator => 
                        mediator.Send(new CreateTenantFromRegistrationCommand(registrationId), CancellationToken.None));
                    return Task.FromResult(jobId);
                }
                break;
                
            // Add more job mappings here as needed
        }

        // Return a fake job ID for unmapped jobs
        return Task.FromResult(Guid.NewGuid().ToString());
    }
}
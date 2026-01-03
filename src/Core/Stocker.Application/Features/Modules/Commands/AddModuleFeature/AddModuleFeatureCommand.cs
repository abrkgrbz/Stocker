using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.AddModuleFeature;

public record AddModuleFeatureCommand(
    Guid ModuleId,
    string FeatureName,
    string? Description) : IRequest<Result>;

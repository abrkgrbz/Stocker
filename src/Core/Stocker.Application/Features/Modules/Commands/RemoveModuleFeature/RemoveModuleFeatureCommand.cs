using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.RemoveModuleFeature;

public record RemoveModuleFeatureCommand(
    Guid ModuleId,
    string FeatureName) : IRequest<Result>;

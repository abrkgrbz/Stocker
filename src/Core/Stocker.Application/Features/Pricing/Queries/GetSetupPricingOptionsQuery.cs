using MediatR;
using Stocker.Application.DTOs.Pricing;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries;

/// <summary>
/// Query to get all pricing options for setup wizard
/// </summary>
public record GetSetupPricingOptionsQuery : IRequest<Result<SetupPricingOptionsDto>>;

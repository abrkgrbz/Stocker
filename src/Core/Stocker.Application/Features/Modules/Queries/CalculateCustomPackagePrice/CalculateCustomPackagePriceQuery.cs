using MediatR;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.CalculateCustomPackagePrice;

public record CalculateCustomPackagePriceQuery(
    List<string> SelectedModuleCodes,
    int UserCount = 1,
    string? StoragePlanCode = null,
    List<string>? SelectedAddOnCodes = null)
    : IRequest<Result<CustomPackagePriceResponseDto>>;

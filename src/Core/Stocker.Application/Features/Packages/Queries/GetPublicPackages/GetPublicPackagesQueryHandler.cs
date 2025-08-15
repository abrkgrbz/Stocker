using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Package;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Queries.GetPublicPackages;

public class GetPublicPackagesQueryHandler : IRequestHandler<GetPublicPackagesQuery, Result<List<PackageDto>>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetPublicPackagesQueryHandler> _logger;

    public GetPublicPackagesQueryHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetPublicPackagesQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<List<PackageDto>>> Handle(GetPublicPackagesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Get all active and public packages with features and modules
            var packages = await _unitOfWork.Packages()
                .AsQueryable()
                .Include(p => p.Features)
                .Include(p => p.Modules)
                .Where(p => p.IsActive && p.IsPublic)
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.BasePrice.Amount)
                .ToListAsync(cancellationToken);

            if (!packages.Any())
            {
                _logger.LogWarning("No public packages found in database");
            }

            var packageDtos = _mapper.Map<List<PackageDto>>(packages);
            
            return Result<List<PackageDto>>.Success(packageDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public packages");
            return Result<List<PackageDto>>.Failure(
                Error.Failure("Packages.RetrievalFailed", "Paketler yüklenemedi"));
        }
    }
}
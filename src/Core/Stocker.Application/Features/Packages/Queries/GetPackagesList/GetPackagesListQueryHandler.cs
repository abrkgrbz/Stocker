using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Package;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Queries.GetPackagesList;

public class GetPackagesListQueryHandler : IRequestHandler<GetPackagesListQuery, Result<List<PackageDto>>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetPackagesListQueryHandler> _logger;

    public GetPackagesListQueryHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetPackagesListQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<List<PackageDto>>> Handle(GetPackagesListQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _unitOfWork.Packages().AsQueryable();

            if (request.OnlyActive)
            {
                query = query.Where(p => p.IsActive);
            }

            var packages = await query
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.BasePrice.Amount)
                .ProjectTo<PackageDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<PackageDto>>.Success(packages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving packages list");
            return Result<List<PackageDto>>.Failure(DomainErrors.General.UnProcessableRequest);
        }
    }
}
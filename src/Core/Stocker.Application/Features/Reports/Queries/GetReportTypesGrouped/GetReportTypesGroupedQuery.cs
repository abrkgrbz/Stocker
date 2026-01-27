using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetReportTypesGrouped;

public record GetReportTypesGroupedQuery : IRequest<Result<Dictionary<string, List<ReportTypeDto>>>>;

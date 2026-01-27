using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetReportTypes;

public record GetReportTypesQuery : IRequest<Result<List<ReportTypeDto>>>;

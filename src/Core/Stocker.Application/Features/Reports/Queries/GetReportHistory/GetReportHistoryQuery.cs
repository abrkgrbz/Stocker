using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetReportHistory;

public record GetReportHistoryQuery(int Page = 1, int PageSize = 10) : IRequest<Result<List<ReportHistoryDto>>>;

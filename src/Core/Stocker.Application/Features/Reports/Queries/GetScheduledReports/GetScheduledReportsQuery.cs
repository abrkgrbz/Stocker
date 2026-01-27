using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetScheduledReports;

public record GetScheduledReportsQuery : IRequest<Result<List<ScheduledReportDto>>>;

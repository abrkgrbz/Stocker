using MediatR;
using Stocker.Application.DTOs.Dashboard;

namespace Stocker.Application.Features.Dashboard.Queries.GetRevenueReport;

public class GetRevenueReportQuery : IRequest<RevenueReportDto>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
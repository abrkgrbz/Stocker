using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Services;
using Stocker.SignalR.Models.Notifications;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Modules.HR.Infrastructure.Services;

/// <summary>
/// SignalR-based implementation of HR notification service.
/// </summary>
public class HrNotificationService : IHrNotificationService
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<HrNotificationService> _logger;

    public HrNotificationService(
        INotificationService notificationService,
        ILogger<HrNotificationService> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    #region Employee Notifications

    public async Task SendProbationEndingAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime probationEndDate,
        int daysRemaining,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏰ Deneme Süresi Bitiyor",
                Message = $"{employeeName} çalışanının deneme süresi {daysRemaining} gün içinde sona erecek.",
                Type = NotificationType.HR,
                Priority = daysRemaining <= 7 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/hr/employees/{employeeId}",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "probation_ending",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["probationEndDate"] = probationEndDate.ToString("yyyy-MM-dd"),
                    ["daysRemaining"] = daysRemaining
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogInformation("Probation ending notification sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send probation ending notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendContractExpiringAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime contractEndDate,
        int daysRemaining,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏰ Sözleşme Bitiyor",
                Message = $"{employeeName} çalışanının sözleşmesi {daysRemaining} gün içinde sona erecek.",
                Type = NotificationType.HR,
                Priority = daysRemaining <= 14 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/hr/employees/{employeeId}",
                Icon = "file-text",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "contract_expiring",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["contractEndDate"] = contractEndDate.ToString("yyyy-MM-dd"),
                    ["daysRemaining"] = daysRemaining
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogInformation("Contract expiring notification sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contract expiring notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendWorkAnniversaryAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        int yearsOfService,
        DateTime anniversaryDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "🎂 İş Yıldönümü",
                Message = $"{employeeName} şirkette {yearsOfService}. yılını kutluyor!",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/employees/{employeeId}",
                Icon = "cake",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "work_anniversary",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["yearsOfService"] = yearsOfService,
                    ["anniversaryDate"] = anniversaryDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Work anniversary notification sent for {EmployeeName} in tenant {TenantId}", employeeName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send work anniversary notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendBirthdayReminderAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime birthDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "🎉 Doğum Günü",
                Message = $"Bugün {employeeName} çalışanının doğum günü!",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/employees/{employeeId}",
                Icon = "gift",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "birthday",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["birthDate"] = birthDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Birthday notification sent for {EmployeeName} in tenant {TenantId}", employeeName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send birthday notification for {EmployeeName}", employeeName);
        }
    }

    #endregion

    #region Leave Notifications

    public async Task SendLeaveRequestSubmittedAsync(
        Guid tenantId,
        int leaveId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        DateTime startDate,
        DateTime endDate,
        decimal totalDays,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "📋 Yeni İzin Talebi",
                Message = $"{employeeName} {totalDays} günlük {leaveTypeName} izni talep etti.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/leaves/{leaveId}",
                Icon = "calendar",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "leave_request_submitted",
                    ["leaveId"] = leaveId,
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["leaveTypeName"] = leaveTypeName,
                    ["startDate"] = startDate.ToString("yyyy-MM-dd"),
                    ["endDate"] = endDate.ToString("yyyy-MM-dd"),
                    ["totalDays"] = totalDays
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogInformation("Leave request submitted notification sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send leave request submitted notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendLeaveRequestApprovedAsync(
        Guid tenantId,
        int leaveId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "✅ İzin Onaylandı",
                Message = $"{leaveTypeName} izin talebiniz onaylandı. ({startDate:dd.MM.yyyy} - {endDate:dd.MM.yyyy})",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/leaves/{leaveId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "leave_request_approved",
                    ["leaveId"] = leaveId,
                    ["leaveTypeName"] = leaveTypeName,
                    ["startDate"] = startDate.ToString("yyyy-MM-dd"),
                    ["endDate"] = endDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Leave request approved notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send leave request approved notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendLeaveRequestRejectedAsync(
        Guid tenantId,
        int leaveId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        string rejectionReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "❌ İzin Reddedildi",
                Message = $"{leaveTypeName} izin talebiniz reddedildi. Sebep: {rejectionReason}",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/leaves/{leaveId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "leave_request_rejected",
                    ["leaveId"] = leaveId,
                    ["leaveTypeName"] = leaveTypeName,
                    ["rejectionReason"] = rejectionReason
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Leave request rejected notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send leave request rejected notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendLeaveBalanceLowAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        decimal remainingDays,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⚠️ Düşük İzin Bakiyesi",
                Message = $"{leaveTypeName} izin bakiyeniz {remainingDays} güne düştü.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/leaves/balance",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "leave_balance_low",
                    ["leaveTypeName"] = leaveTypeName,
                    ["remainingDays"] = remainingDays
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Leave balance low notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send leave balance low notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendLeaveBalanceExpiringAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        decimal expiringDays,
        DateTime expiryDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏰ İzin Süresi Doluyor",
                Message = $"{expiringDays} gün {leaveTypeName} izniniz {expiryDate:dd.MM.yyyy} tarihinde sona erecek.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.High,
                ActionUrl = $"/hr/leaves/balance",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "leave_balance_expiring",
                    ["leaveTypeName"] = leaveTypeName,
                    ["expiringDays"] = expiringDays,
                    ["expiryDate"] = expiryDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Leave balance expiring notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send leave balance expiring notification for {EmployeeName}", employeeName);
        }
    }

    #endregion

    #region Attendance Notifications

    public async Task SendLateArrivalAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime expectedTime,
        DateTime actualTime,
        TimeSpan lateBy,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏰ Geç Giriş",
                Message = $"{employeeName} çalışanı {lateBy.TotalMinutes:F0} dakika geç geldi.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/attendance",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "late_arrival",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["expectedTime"] = expectedTime.ToString("HH:mm"),
                    ["actualTime"] = actualTime.ToString("HH:mm"),
                    ["lateByMinutes"] = lateBy.TotalMinutes
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogInformation("Late arrival alert sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send late arrival alert for {EmployeeName}", employeeName);
        }
    }

    public async Task SendAbsenceAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime date,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "🚨 Devamsızlık",
                Message = $"{employeeName} çalışanı {date:dd.MM.yyyy} tarihinde devamsız.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.High,
                ActionUrl = $"/hr/attendance",
                Icon = "alert-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "absence",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["date"] = date.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogWarning("Absence alert sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send absence alert for {EmployeeName}", employeeName);
        }
    }

    public async Task SendOvertimeAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime date,
        TimeSpan overtimeHours,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏱️ Fazla Mesai",
                Message = $"{employeeName} çalışanı {date:dd.MM.yyyy} tarihinde {overtimeHours.TotalHours:F1} saat fazla mesai yaptı.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/attendance",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "overtime",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["date"] = date.ToString("yyyy-MM-dd"),
                    ["overtimeHours"] = overtimeHours.TotalHours
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogInformation("Overtime alert sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send overtime alert for {EmployeeName}", employeeName);
        }
    }

    #endregion

    #region Expense Notifications

    public async Task SendExpenseSubmittedAsync(
        Guid tenantId,
        int expenseId,
        int employeeId,
        string employeeName,
        string expenseType,
        decimal amount,
        string currency,
        int approverId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "📋 Yeni Masraf Talebi",
                Message = $"{employeeName} {amount:N0} {currency} tutarında {expenseType} masrafı talep etti.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/expenses/{expenseId}",
                Icon = "receipt",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "expense_submitted",
                    ["expenseId"] = expenseId,
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["expenseType"] = expenseType,
                    ["amount"] = amount,
                    ["currency"] = currency
                }
            };

            await _notificationService.SendToUserAsync(approverId.ToString(), notification);
            _logger.LogInformation("Expense submitted notification sent for {EmployeeName} to approver {ApproverId}", employeeName, approverId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send expense submitted notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendExpenseApprovedAsync(
        Guid tenantId,
        int expenseId,
        int employeeId,
        string employeeName,
        decimal amount,
        string currency,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "✅ Masraf Onaylandı",
                Message = $"{amount:N0} {currency} tutarındaki masraf talebiniz onaylandı.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/expenses/{expenseId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "expense_approved",
                    ["expenseId"] = expenseId,
                    ["amount"] = amount,
                    ["currency"] = currency
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Expense approved notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send expense approved notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendExpenseRejectedAsync(
        Guid tenantId,
        int expenseId,
        int employeeId,
        string employeeName,
        decimal amount,
        string rejectionReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "❌ Masraf Reddedildi",
                Message = $"Masraf talebiniz reddedildi. Sebep: {rejectionReason}",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/expenses/{expenseId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "expense_rejected",
                    ["expenseId"] = expenseId,
                    ["amount"] = amount,
                    ["rejectionReason"] = rejectionReason
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Expense rejected notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send expense rejected notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendExpenseBudgetExceededAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string budgetCategory,
        decimal budgetLimit,
        decimal excessAmount,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "🚨 Bütçe Aşıldı",
                Message = $"{employeeName} çalışanı {budgetCategory} bütçesini {excessAmount:N0} aştı.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.High,
                ActionUrl = $"/hr/expenses",
                Icon = "alert-octagon",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "expense_budget_exceeded",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["budgetCategory"] = budgetCategory,
                    ["budgetLimit"] = budgetLimit,
                    ["excessAmount"] = excessAmount
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogWarning("Budget exceeded alert sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send budget exceeded alert for {EmployeeName}", employeeName);
        }
    }

    #endregion

    #region Performance Review Notifications

    public async Task SendPerformanceReviewSubmittedAsync(
        Guid tenantId,
        int reviewId,
        int employeeId,
        string employeeName,
        string reviewerName,
        string reviewPeriod,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "📋 Performans Değerlendirmesi",
                Message = $"{reviewPeriod} dönemi performans değerlendirmeniz {reviewerName} tarafından gönderildi.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/performance/{reviewId}",
                Icon = "clipboard",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "performance_review_submitted",
                    ["reviewId"] = reviewId,
                    ["reviewPeriod"] = reviewPeriod,
                    ["reviewerName"] = reviewerName
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Performance review submitted notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send performance review submitted notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendPerformanceReviewDueAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        int reviewerId,
        string reviewPeriod,
        DateTime dueDate,
        int daysRemaining,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏰ Performans Değerlendirmesi Bekleniyor",
                Message = $"{employeeName} için {reviewPeriod} dönemi değerlendirmesi {daysRemaining} gün içinde tamamlanmalı.",
                Type = NotificationType.HR,
                Priority = daysRemaining <= 3 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/hr/performance",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "performance_review_due",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["reviewPeriod"] = reviewPeriod,
                    ["dueDate"] = dueDate.ToString("yyyy-MM-dd"),
                    ["daysRemaining"] = daysRemaining
                }
            };

            await _notificationService.SendToUserAsync(reviewerId.ToString(), notification);
            _logger.LogInformation("Performance review due notification sent for {EmployeeName} to reviewer {ReviewerId}", employeeName, reviewerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send performance review due notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendLowPerformanceAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        decimal rating,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⚠️ Düşük Performans Uyarısı",
                Message = $"{employeeName} çalışanının performans puanı {rating:F1} olarak değerlendirildi.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.High,
                ActionUrl = $"/hr/employees/{employeeId}/performance",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "low_performance",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["rating"] = rating
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogWarning("Low performance alert sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send low performance alert for {EmployeeName}", employeeName);
        }
    }

    #endregion

    #region Training Notifications

    public async Task SendTrainingEnrollmentAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string trainingName,
        DateTime startDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "📚 Eğitime Kayıt",
                Message = $"'{trainingName}' eğitimine kaydınız yapıldı. Başlangıç: {startDate:dd.MM.yyyy}",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/training",
                Icon = "book",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "training_enrollment",
                    ["trainingName"] = trainingName,
                    ["startDate"] = startDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Training enrollment notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send training enrollment notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendTrainingDeadlineApproachingAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string trainingName,
        DateTime deadline,
        int daysRemaining,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏰ Eğitim Son Tarihi Yaklaşıyor",
                Message = $"'{trainingName}' eğitimi için {daysRemaining} gün kaldı!",
                Type = NotificationType.HR,
                Priority = daysRemaining <= 3 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/hr/training",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "training_deadline_approaching",
                    ["trainingName"] = trainingName,
                    ["deadline"] = deadline.ToString("yyyy-MM-dd"),
                    ["daysRemaining"] = daysRemaining
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Training deadline approaching notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send training deadline approaching notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendMandatoryTrainingOverdueAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string trainingName,
        int daysOverdue,
        int managerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "🚨 Zorunlu Eğitim Gecikmesi",
                Message = $"{employeeName} çalışanının '{trainingName}' zorunlu eğitimi {daysOverdue} gün gecikmiş.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/hr/training",
                Icon = "alert-octagon",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "mandatory_training_overdue",
                    ["employeeId"] = employeeId,
                    ["employeeName"] = employeeName,
                    ["trainingName"] = trainingName,
                    ["daysOverdue"] = daysOverdue
                }
            };

            await _notificationService.SendToUserAsync(managerId.ToString(), notification);
            _logger.LogWarning("Mandatory training overdue alert sent for {EmployeeName} to manager {ManagerId}", employeeName, managerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send mandatory training overdue alert for {EmployeeName}", employeeName);
        }
    }

    public async Task SendCertificationExpiringAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string certificationName,
        DateTime expiryDate,
        int daysRemaining,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "⏰ Sertifika Süresi Doluyor",
                Message = $"'{certificationName}' sertifikanız {daysRemaining} gün içinde sona erecek.",
                Type = NotificationType.HR,
                Priority = daysRemaining <= 14 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/hr/certifications",
                Icon = "award",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "certification_expiring",
                    ["certificationName"] = certificationName,
                    ["expiryDate"] = expiryDate.ToString("yyyy-MM-dd"),
                    ["daysRemaining"] = daysRemaining
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Certification expiring notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send certification expiring notification for {EmployeeName}", employeeName);
        }
    }

    #endregion

    #region Payroll Notifications

    public async Task SendSalaryPaidAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        decimal amount,
        string currency,
        DateTime paymentDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "💰 Maaş Ödendi",
                Message = $"{amount:N0} {currency} tutarında maaşınız hesabınıza yatırıldı.",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/payroll",
                Icon = "dollar-sign",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "salary_paid",
                    ["amount"] = amount,
                    ["currency"] = currency,
                    ["paymentDate"] = paymentDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Salary paid notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send salary paid notification for {EmployeeName}", employeeName);
        }
    }

    public async Task SendBonusAwardedAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        decimal bonusAmount,
        string currency,
        string bonusType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "🎉 Bonus Kazandınız!",
                Message = $"{bonusAmount:N0} {currency} tutarında {bonusType} bonusu kazandınız!",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/payroll",
                Icon = "gift",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "bonus_awarded",
                    ["bonusAmount"] = bonusAmount,
                    ["currency"] = currency,
                    ["bonusType"] = bonusType
                }
            };

            await _notificationService.SendToUserAsync(employeeId.ToString(), notification);
            _logger.LogInformation("Bonus awarded notification sent to {EmployeeName}", employeeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send bonus awarded notification for {EmployeeName}", employeeName);
        }
    }

    #endregion

    #region Announcement Notifications

    public async Task SendAnnouncementPublishedAsync(
        Guid tenantId,
        int announcementId,
        string title,
        string announcementType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "📢 Yeni Duyuru",
                Message = title,
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/announcements/{announcementId}",
                Icon = "megaphone",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "announcement_published",
                    ["announcementId"] = announcementId,
                    ["title"] = title,
                    ["announcementType"] = announcementType
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Announcement published notification sent for '{Title}' in tenant {TenantId}", title, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send announcement published notification for '{Title}'", title);
        }
    }

    public async Task SendUpcomingHolidayAsync(
        Guid tenantId,
        string holidayName,
        DateTime holidayDate,
        int daysRemaining,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "🎉 Yaklaşan Tatil",
                Message = $"{holidayName} tatili {daysRemaining} gün içinde!",
                Type = NotificationType.HR,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/hr/calendar",
                Icon = "calendar",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "upcoming_holiday",
                    ["holidayName"] = holidayName,
                    ["holidayDate"] = holidayDate.ToString("yyyy-MM-dd"),
                    ["daysRemaining"] = daysRemaining
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Upcoming holiday notification sent for '{HolidayName}' in tenant {TenantId}", holidayName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send upcoming holiday notification for '{HolidayName}'", holidayName);
        }
    }

    #endregion
}

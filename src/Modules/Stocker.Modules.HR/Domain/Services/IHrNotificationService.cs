namespace Stocker.Modules.HR.Domain.Services;

/// <summary>
/// HR notification service interface for sending real-time notifications.
/// </summary>
public interface IHrNotificationService
{
    #region Employee Notifications

    /// <summary>
    /// Send notification when employee probation is ending.
    /// </summary>
    Task SendProbationEndingAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime probationEndDate,
        int daysRemaining,
        int managerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when employee contract is expiring.
    /// </summary>
    Task SendContractExpiringAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime contractEndDate,
        int daysRemaining,
        int managerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification for employee work anniversary.
    /// </summary>
    Task SendWorkAnniversaryAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        int yearsOfService,
        DateTime anniversaryDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification for employee birthday.
    /// </summary>
    Task SendBirthdayReminderAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime birthDate,
        CancellationToken cancellationToken = default);

    #endregion

    #region Leave Notifications

    /// <summary>
    /// Send notification when leave request is submitted.
    /// </summary>
    Task SendLeaveRequestSubmittedAsync(
        Guid tenantId,
        int leaveId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        DateTime startDate,
        DateTime endDate,
        decimal totalDays,
        int managerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when leave request is approved.
    /// </summary>
    Task SendLeaveRequestApprovedAsync(
        Guid tenantId,
        int leaveId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when leave request is rejected.
    /// </summary>
    Task SendLeaveRequestRejectedAsync(
        Guid tenantId,
        int leaveId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        string rejectionReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when leave balance is low.
    /// </summary>
    Task SendLeaveBalanceLowAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        decimal remainingDays,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when leave balance is about to expire.
    /// </summary>
    Task SendLeaveBalanceExpiringAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string leaveTypeName,
        decimal expiringDays,
        DateTime expiryDate,
        CancellationToken cancellationToken = default);

    #endregion

    #region Attendance Notifications

    /// <summary>
    /// Send notification when employee is late.
    /// </summary>
    Task SendLateArrivalAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime expectedTime,
        DateTime actualTime,
        TimeSpan lateBy,
        int managerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when employee is absent.
    /// </summary>
    Task SendAbsenceAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime date,
        int managerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when overtime is detected.
    /// </summary>
    Task SendOvertimeAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        DateTime date,
        TimeSpan overtimeHours,
        int managerId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Expense Notifications

    /// <summary>
    /// Send notification when expense is submitted for approval.
    /// </summary>
    Task SendExpenseSubmittedAsync(
        Guid tenantId,
        int expenseId,
        int employeeId,
        string employeeName,
        string expenseType,
        decimal amount,
        string currency,
        int approverId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when expense is approved.
    /// </summary>
    Task SendExpenseApprovedAsync(
        Guid tenantId,
        int expenseId,
        int employeeId,
        string employeeName,
        decimal amount,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when expense is rejected.
    /// </summary>
    Task SendExpenseRejectedAsync(
        Guid tenantId,
        int expenseId,
        int employeeId,
        string employeeName,
        decimal amount,
        string rejectionReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when expense budget is exceeded.
    /// </summary>
    Task SendExpenseBudgetExceededAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string budgetCategory,
        decimal budgetLimit,
        decimal excessAmount,
        int managerId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Performance Review Notifications

    /// <summary>
    /// Send notification when performance review is submitted.
    /// </summary>
    Task SendPerformanceReviewSubmittedAsync(
        Guid tenantId,
        int reviewId,
        int employeeId,
        string employeeName,
        string reviewerName,
        string reviewPeriod,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when performance review is due.
    /// </summary>
    Task SendPerformanceReviewDueAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        int reviewerId,
        string reviewPeriod,
        DateTime dueDate,
        int daysRemaining,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification for low performance rating.
    /// </summary>
    Task SendLowPerformanceAlertAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        decimal rating,
        int managerId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Training Notifications

    /// <summary>
    /// Send notification when employee is enrolled in training.
    /// </summary>
    Task SendTrainingEnrollmentAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string trainingName,
        DateTime startDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when training deadline is approaching.
    /// </summary>
    Task SendTrainingDeadlineApproachingAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string trainingName,
        DateTime deadline,
        int daysRemaining,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when mandatory training is overdue.
    /// </summary>
    Task SendMandatoryTrainingOverdueAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string trainingName,
        int daysOverdue,
        int managerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when certification is expiring.
    /// </summary>
    Task SendCertificationExpiringAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        string certificationName,
        DateTime expiryDate,
        int daysRemaining,
        CancellationToken cancellationToken = default);

    #endregion

    #region Payroll Notifications

    /// <summary>
    /// Send notification when salary is paid.
    /// </summary>
    Task SendSalaryPaidAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        decimal amount,
        string currency,
        DateTime paymentDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification when bonus is awarded.
    /// </summary>
    Task SendBonusAwardedAsync(
        Guid tenantId,
        int employeeId,
        string employeeName,
        decimal bonusAmount,
        string currency,
        string bonusType,
        CancellationToken cancellationToken = default);

    #endregion

    #region Announcement Notifications

    /// <summary>
    /// Send notification when HR announcement is published.
    /// </summary>
    Task SendAnnouncementPublishedAsync(
        Guid tenantId,
        int announcementId,
        string title,
        string announcementType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Send notification for upcoming holiday.
    /// </summary>
    Task SendUpcomingHolidayAsync(
        Guid tenantId,
        string holidayName,
        DateTime holidayDate,
        int daysRemaining,
        CancellationToken cancellationToken = default);

    #endregion
}

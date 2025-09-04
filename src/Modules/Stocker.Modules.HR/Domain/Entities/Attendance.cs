using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

public class Attendance : BaseEntity
{
    public int EmployeeId { get; private set; }
    public DateTime Date { get; private set; }
    public TimeSpan? CheckInTime { get; private set; }
    public TimeSpan? CheckOutTime { get; private set; }
    public TimeSpan? WorkHours { get; private set; }
    public TimeSpan? OvertimeHours { get; private set; }
    public string Status { get; private set; }
    public string? Notes { get; private set; }
    public bool IsLate { get; private set; }
    public bool IsEarlyDeparture { get; private set; }
    public bool IsWeekend { get; private set; }
    public bool IsHoliday { get; private set; }
    
    public virtual Employee Employee { get; private set; }
    
    protected Attendance() { }
    
    public Attendance(int employeeId, DateTime date)
    {
        EmployeeId = employeeId;
        Date = date.Date;
        Status = "Absent";
        IsWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
        IsHoliday = false;
        IsLate = false;
        IsEarlyDeparture = false;
    }
    
    public void CheckIn(TimeSpan time, TimeSpan expectedCheckIn)
    {
        CheckInTime = time;
        Status = "Present";
        IsLate = time > expectedCheckIn.Add(TimeSpan.FromMinutes(15));
    }
    
    public void CheckOut(TimeSpan time, TimeSpan expectedCheckOut)
    {
        CheckOutTime = time;
        IsEarlyDeparture = time < expectedCheckOut.Subtract(TimeSpan.FromMinutes(15));
        
        if (CheckInTime.HasValue)
        {
            WorkHours = CheckOutTime.Value - CheckInTime.Value;
            
            var standardWorkHours = TimeSpan.FromHours(8);
            if (WorkHours > standardWorkHours)
            {
                OvertimeHours = WorkHours.Value - standardWorkHours;
            }
        }
    }
    
    public void MarkAsLeave(string leaveType)
    {
        Status = $"Leave - {leaveType}";
    }
    
    public void MarkAsHoliday()
    {
        IsHoliday = true;
        Status = "Holiday";
    }
    
    public void SetNotes(string notes)
    {
        Notes = notes;
    }
}
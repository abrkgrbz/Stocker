// HR Module Types

export interface Employee {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    departmentId: string;
    departmentName: string;
    positionId: string;
    positionName: string;
    managerId?: string;
    managerName?: string;
    status: EmployeeStatus;
    hireDate: string;
    terminationDate?: string;
    profileImageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'suspended';

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    status: LeaveStatus;
    reason?: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    rejectionReason?: string;
    createdAt: string;
}

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'marriage' | 'bereavement' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveBalance {
    employeeId: string;
    annualTotal: number;
    annualUsed: number;
    annualRemaining: number;
    sickTotal: number;
    sickUsed: number;
    sickRemaining: number;
}

export interface Asset {
    id: string;
    assetNumber: string;
    name: string;
    description?: string;
    categoryId: string;
    categoryName: string;
    status: AssetStatus;
    assignedToId?: string;
    assignedToName?: string;
    assignedDate?: string;
    serialNumber?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    warrantyExpiry?: string;
    notes?: string;
    createdAt: string;
}

export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired';

export interface Attendance {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: AttendanceStatus;
    workHours?: number;
    overtimeHours?: number;
    notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'remote' | 'holiday' | 'leave';

// HR Dashboard Stats
export interface HRStats {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveCount: number;
    pendingLeaveRequests: number;
    todayAbsent: number;
    totalAssets: number;
    assignedAssets: number;
}

// Department
export interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
    managerId?: string;
    managerName?: string;
    parentDepartmentId?: string;
    parentDepartmentName?: string;
    employeeCount: number;
    isActive: boolean;
}

// Position
export interface Position {
    id: string;
    code: string;
    title: string;
    departmentId: string;
    departmentName?: string;
    level: number;
    headCount?: number;
    filledPositions: number;
    isActive: boolean;
}

// List Params
export interface EmployeeListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    departmentId?: string;
    positionId?: string;
    status?: EmployeeStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
    items: Employee[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface LeaveListParams {
    page?: number;
    pageSize?: number;
    employeeId?: string;
    departmentId?: string;
    status?: LeaveStatus;
    type?: LeaveType;
    startDate?: string;
    endDate?: string;
}

export interface LeaveListResponse {
    items: LeaveRequest[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AttendanceListParams {
    employeeId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
    page?: number;
    pageSize?: number;
}

export interface AttendanceListResponse {
    items: Attendance[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Create/Update Requests
export interface CreateLeaveRequestDto {
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason?: string;
}

export interface UpdateLeaveRequestDto {
    type?: LeaveType;
    startDate?: string;
    endDate?: string;
    reason?: string;
}

export interface ApproveLeaveDto {
    notes?: string;
}

export interface RejectLeaveDto {
    reason: string;
}

export interface CheckInDto {
    employeeId: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
}

export interface CheckOutDto {
    employeeId: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
}

// Attendance Summary
export interface AttendanceSummary {
    employeeId: string;
    employeeName: string;
    month: number;
    year: number;
    totalWorkDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    totalWorkedHours: number;
    totalOvertimeHours: number;
    attendancePercentage: number;
}

// Daily Attendance Summary
export interface DailyAttendanceSummary {
    date: string;
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    onLeaveCount: number;
    attendanceRate: number;
}

// Shift
export interface Shift {
    id: string;
    code: string;
    name: string;
    startTime: string;
    endTime: string;
    breakDurationMinutes: number;
    workHoursPerDay: number;
    isActive: boolean;
}

// Holiday
export interface Holiday {
    id: string;
    name: string;
    date: string;
    isRecurring: boolean;
    isNational: boolean;
    isActive: boolean;
}

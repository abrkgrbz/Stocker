import api from '@/lib/axios';
import type {
    Employee,
    EmployeeListParams,
    EmployeeListResponse,
    LeaveRequest,
    LeaveListParams,
    LeaveListResponse,
    LeaveBalance,
    Attendance,
    AttendanceListParams,
    AttendanceListResponse,
    AttendanceSummary,
    DailyAttendanceSummary,
    Department,
    Position,
    Shift,
    Holiday,
    HRStats,
    CreateLeaveRequestDto,
    UpdateLeaveRequestDto,
    ApproveLeaveDto,
    RejectLeaveDto,
    CheckInDto,
    CheckOutDto,
} from '../types/hr.types';

class HRService {
    private readonly baseUrl = '/hr';

    // ============= EMPLOYEES =============

    async getEmployees(params?: EmployeeListParams): Promise<EmployeeListResponse> {
        const response = await api.get<EmployeeListResponse>(`${this.baseUrl}/employees`, { params });
        return response.data;
    }

    async getEmployee(id: string): Promise<Employee> {
        const response = await api.get<Employee>(`${this.baseUrl}/employees/${id}`);
        return response.data;
    }

    async getCurrentEmployee(): Promise<Employee> {
        const response = await api.get<Employee>(`${this.baseUrl}/employees/me`);
        return response.data;
    }

    async searchEmployees(query: string): Promise<Employee[]> {
        const response = await api.get<Employee[]>(`${this.baseUrl}/employees/search`, {
            params: { q: query }
        });
        return response.data;
    }

    async getEmployeesByDepartment(departmentId: string): Promise<Employee[]> {
        const response = await api.get<Employee[]>(`${this.baseUrl}/departments/${departmentId}/employees`);
        return response.data;
    }

    // ============= LEAVE REQUESTS =============

    async getLeaveRequests(params?: LeaveListParams): Promise<LeaveListResponse> {
        const response = await api.get<LeaveListResponse>(`${this.baseUrl}/leaves`, { params });
        return response.data;
    }

    async getLeaveRequest(id: string): Promise<LeaveRequest> {
        const response = await api.get<LeaveRequest>(`${this.baseUrl}/leaves/${id}`);
        return response.data;
    }

    async getMyLeaveRequests(params?: LeaveListParams): Promise<LeaveListResponse> {
        const response = await api.get<LeaveListResponse>(`${this.baseUrl}/leaves/my`, { params });
        return response.data;
    }

    async getPendingApprovals(): Promise<LeaveRequest[]> {
        const response = await api.get<LeaveRequest[]>(`${this.baseUrl}/leaves/pending-approvals`);
        return response.data;
    }

    async createLeaveRequest(data: CreateLeaveRequestDto): Promise<LeaveRequest> {
        const response = await api.post<LeaveRequest>(`${this.baseUrl}/leaves`, data);
        return response.data;
    }

    async updateLeaveRequest(id: string, data: UpdateLeaveRequestDto): Promise<LeaveRequest> {
        const response = await api.put<LeaveRequest>(`${this.baseUrl}/leaves/${id}`, data);
        return response.data;
    }

    async approveLeaveRequest(id: string, data?: ApproveLeaveDto): Promise<LeaveRequest> {
        const response = await api.post<LeaveRequest>(`${this.baseUrl}/leaves/${id}/approve`, data || {});
        return response.data;
    }

    async rejectLeaveRequest(id: string, data: RejectLeaveDto): Promise<LeaveRequest> {
        const response = await api.post<LeaveRequest>(`${this.baseUrl}/leaves/${id}/reject`, data);
        return response.data;
    }

    async cancelLeaveRequest(id: string): Promise<void> {
        await api.post(`${this.baseUrl}/leaves/${id}/cancel`);
    }

    async getLeaveBalance(employeeId?: string): Promise<LeaveBalance> {
        const url = employeeId
            ? `${this.baseUrl}/employees/${employeeId}/leave-balance`
            : `${this.baseUrl}/leaves/my/balance`;
        const response = await api.get<LeaveBalance>(url);
        return response.data;
    }

    async getLeaveCalendar(params?: {
        departmentId?: string;
        month?: number;
        year?: number;
    }): Promise<LeaveRequest[]> {
        const response = await api.get<LeaveRequest[]>(`${this.baseUrl}/leaves/calendar`, { params });
        return response.data;
    }

    // ============= ATTENDANCE =============

    async getAttendance(params?: AttendanceListParams): Promise<AttendanceListResponse> {
        const response = await api.get<AttendanceListResponse>(`${this.baseUrl}/attendance`, { params });
        return response.data;
    }

    async getMyAttendance(params?: { startDate?: string; endDate?: string }): Promise<Attendance[]> {
        const response = await api.get<Attendance[]>(`${this.baseUrl}/attendance/my`, { params });
        return response.data;
    }

    async getTodayAttendance(departmentId?: string): Promise<Attendance[]> {
        const response = await api.get<Attendance[]>(`${this.baseUrl}/attendance/today`, {
            params: { departmentId }
        });
        return response.data;
    }

    async checkIn(data: CheckInDto): Promise<Attendance> {
        const response = await api.post<Attendance>(`${this.baseUrl}/attendance/check-in`, data);
        return response.data;
    }

    async checkOut(data: CheckOutDto): Promise<Attendance> {
        const response = await api.post<Attendance>(`${this.baseUrl}/attendance/check-out`, data);
        return response.data;
    }

    async getMyTodayAttendance(): Promise<Attendance | null> {
        try {
            const response = await api.get<Attendance>(`${this.baseUrl}/attendance/my/today`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async getAttendanceSummary(params: {
        employeeId?: string;
        departmentId?: string;
        month: number;
        year: number;
    }): Promise<AttendanceSummary[]> {
        const response = await api.get<AttendanceSummary[]>(`${this.baseUrl}/attendance/summary`, { params });
        return response.data;
    }

    async getDailyAttendanceSummary(params?: {
        date?: string;
        departmentId?: string;
    }): Promise<DailyAttendanceSummary> {
        const response = await api.get<DailyAttendanceSummary>(`${this.baseUrl}/attendance/daily-summary`, { params });
        return response.data;
    }

    // ============= DEPARTMENTS =============

    async getDepartments(): Promise<Department[]> {
        const response = await api.get<Department[]>(`${this.baseUrl}/departments`);
        return response.data;
    }

    async getDepartment(id: string): Promise<Department> {
        const response = await api.get<Department>(`${this.baseUrl}/departments/${id}`);
        return response.data;
    }

    async getDepartmentTree(): Promise<Department[]> {
        const response = await api.get<Department[]>(`${this.baseUrl}/departments/tree`);
        return response.data;
    }

    // ============= POSITIONS =============

    async getPositions(departmentId?: string): Promise<Position[]> {
        const response = await api.get<Position[]>(`${this.baseUrl}/positions`, {
            params: { departmentId }
        });
        return response.data;
    }

    async getPosition(id: string): Promise<Position> {
        const response = await api.get<Position>(`${this.baseUrl}/positions/${id}`);
        return response.data;
    }

    // ============= SHIFTS =============

    async getShifts(): Promise<Shift[]> {
        const response = await api.get<Shift[]>(`${this.baseUrl}/shifts`);
        return response.data;
    }

    async getShift(id: string): Promise<Shift> {
        const response = await api.get<Shift>(`${this.baseUrl}/shifts/${id}`);
        return response.data;
    }

    // ============= HOLIDAYS =============

    async getHolidays(year?: number): Promise<Holiday[]> {
        const response = await api.get<Holiday[]>(`${this.baseUrl}/holidays`, {
            params: { year }
        });
        return response.data;
    }

    async getUpcomingHolidays(limit?: number): Promise<Holiday[]> {
        const response = await api.get<Holiday[]>(`${this.baseUrl}/holidays/upcoming`, {
            params: { limit }
        });
        return response.data;
    }

    // ============= DASHBOARD / KPIS =============

    async getHRStats(): Promise<HRStats> {
        const response = await api.get<HRStats>(`${this.baseUrl}/stats`);
        return response.data;
    }

    async getDashboardData(): Promise<{
        stats: HRStats;
        pendingLeaves: LeaveRequest[];
        todayAttendance: DailyAttendanceSummary;
        upcomingHolidays: Holiday[];
        recentLeaves: LeaveRequest[];
    }> {
        const response = await api.get(`${this.baseUrl}/dashboard`);
        return response.data;
    }
}

export const hrService = new HRService();
export default hrService;

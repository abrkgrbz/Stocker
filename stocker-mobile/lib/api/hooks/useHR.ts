import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrService } from '../services/hr.service';
import type {
    EmployeeListParams,
    LeaveListParams,
    AttendanceListParams,
    AssetListParams,
    CreateLeaveRequestDto,
    UpdateLeaveRequestDto,
    ApproveLeaveDto,
    RejectLeaveDto,
    CheckInDto,
    CheckOutDto,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    LeaveStatus,
    LeaveType,
} from '../types/hr.types';

// Query Keys
export const hrKeys = {
    all: ['hr'] as const,
    // Employees
    employees: () => [...hrKeys.all, 'employees'] as const,
    employeeList: (params?: EmployeeListParams) => [...hrKeys.employees(), 'list', params] as const,
    employeeDetail: (id: string) => [...hrKeys.employees(), 'detail', id] as const,
    currentEmployee: () => [...hrKeys.employees(), 'me'] as const,
    // Leaves
    leaves: () => [...hrKeys.all, 'leaves'] as const,
    leaveList: (params?: LeaveListParams) => [...hrKeys.leaves(), 'list', params] as const,
    leaveDetail: (id: string) => [...hrKeys.leaves(), 'detail', id] as const,
    myLeaves: (params?: LeaveListParams) => [...hrKeys.leaves(), 'my', params] as const,
    pendingApprovals: () => [...hrKeys.leaves(), 'pending-approvals'] as const,
    leaveBalance: (employeeId?: string) => [...hrKeys.leaves(), 'balance', employeeId] as const,
    leaveCalendar: (params?: any) => [...hrKeys.leaves(), 'calendar', params] as const,
    // Attendance
    attendance: () => [...hrKeys.all, 'attendance'] as const,
    attendanceList: (params?: AttendanceListParams) => [...hrKeys.attendance(), 'list', params] as const,
    myAttendance: (params?: any) => [...hrKeys.attendance(), 'my', params] as const,
    todayAttendance: (departmentId?: string) => [...hrKeys.attendance(), 'today', departmentId] as const,
    myTodayAttendance: () => [...hrKeys.attendance(), 'my', 'today'] as const,
    attendanceSummary: (params?: any) => [...hrKeys.attendance(), 'summary', params] as const,
    dailySummary: (params?: any) => [...hrKeys.attendance(), 'daily-summary', params] as const,
    // Departments
    departments: () => [...hrKeys.all, 'departments'] as const,
    departmentDetail: (id: string) => [...hrKeys.departments(), 'detail', id] as const,
    departmentTree: () => [...hrKeys.departments(), 'tree'] as const,
    departmentEmployees: (id: string) => [...hrKeys.departments(), 'employees', id] as const,
    // Positions
    positions: () => [...hrKeys.all, 'positions'] as const,
    positionList: (departmentId?: string) => [...hrKeys.positions(), 'list', departmentId] as const,
    positionDetail: (id: string) => [...hrKeys.positions(), 'detail', id] as const,
    // Shifts
    shifts: () => [...hrKeys.all, 'shifts'] as const,
    shiftDetail: (id: string) => [...hrKeys.shifts(), 'detail', id] as const,
    // Holidays
    holidays: () => [...hrKeys.all, 'holidays'] as const,
    holidayList: (year?: number) => [...hrKeys.holidays(), 'list', year] as const,
    upcomingHolidays: () => [...hrKeys.holidays(), 'upcoming'] as const,
    // Assets
    assets: () => [...hrKeys.all, 'assets'] as const,
    assetList: (params?: AssetListParams) => [...hrKeys.assets(), 'list', params] as const,
    assetDetail: (id: string) => [...hrKeys.assets(), 'detail', id] as const,
    assetCategories: () => [...hrKeys.assets(), 'categories'] as const,
    employeeAssets: (employeeId: string) => [...hrKeys.assets(), 'employee', employeeId] as const,
    // Dashboard
    stats: () => [...hrKeys.all, 'stats'] as const,
    dashboard: () => [...hrKeys.all, 'dashboard'] as const,
};

// ============= EMPLOYEE HOOKS =============

export function useEmployees(params?: EmployeeListParams) {
    return useQuery({
        queryKey: hrKeys.employeeList(params),
        queryFn: () => hrService.getEmployees(params),
    });
}

export function useEmployee(id: string) {
    return useQuery({
        queryKey: hrKeys.employeeDetail(id),
        queryFn: () => hrService.getEmployee(id),
        enabled: !!id,
    });
}

export function useCurrentEmployee() {
    return useQuery({
        queryKey: hrKeys.currentEmployee(),
        queryFn: () => hrService.getCurrentEmployee(),
    });
}

export function useSearchEmployees(query: string) {
    return useQuery({
        queryKey: [...hrKeys.employees(), 'search', query],
        queryFn: () => hrService.searchEmployees(query),
        enabled: query.length >= 2,
    });
}

export function useEmployeesByDepartment(departmentId: string) {
    return useQuery({
        queryKey: hrKeys.departmentEmployees(departmentId),
        queryFn: () => hrService.getEmployeesByDepartment(departmentId),
        enabled: !!departmentId,
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEmployeeDto) => hrService.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
            hrService.updateEmployee(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.employeeDetail(id) });
            queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
        },
    });
}

export function useDeleteEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrService.deleteEmployee(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

// ============= LEAVE HOOKS =============

export function useLeaveRequests(params?: LeaveListParams) {
    return useQuery({
        queryKey: hrKeys.leaveList(params),
        queryFn: () => hrService.getLeaveRequests(params),
    });
}

export function useLeaveRequest(id: string) {
    return useQuery({
        queryKey: hrKeys.leaveDetail(id),
        queryFn: () => hrService.getLeaveRequest(id),
        enabled: !!id,
    });
}

export function useMyLeaveRequests(params?: LeaveListParams) {
    return useQuery({
        queryKey: hrKeys.myLeaves(params),
        queryFn: () => hrService.getMyLeaveRequests(params),
    });
}

export function usePendingApprovals() {
    return useQuery({
        queryKey: hrKeys.pendingApprovals(),
        queryFn: () => hrService.getPendingApprovals(),
    });
}

export function useLeaveBalance(employeeId?: string) {
    return useQuery({
        queryKey: hrKeys.leaveBalance(employeeId),
        queryFn: () => hrService.getLeaveBalance(employeeId),
    });
}

export function useLeaveCalendar(params?: {
    departmentId?: string;
    month?: number;
    year?: number;
}) {
    return useQuery({
        queryKey: hrKeys.leaveCalendar(params),
        queryFn: () => hrService.getLeaveCalendar(params),
    });
}

export function useCreateLeaveRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateLeaveRequestDto) => hrService.createLeaveRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.leaves() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

export function useUpdateLeaveRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLeaveRequestDto }) =>
            hrService.updateLeaveRequest(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.leaveDetail(id) });
            queryClient.invalidateQueries({ queryKey: hrKeys.leaves() });
        },
    });
}

export function useApproveLeaveRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: ApproveLeaveDto }) =>
            hrService.approveLeaveRequest(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.leaveDetail(id) });
            queryClient.invalidateQueries({ queryKey: hrKeys.leaves() });
            queryClient.invalidateQueries({ queryKey: hrKeys.pendingApprovals() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

export function useRejectLeaveRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RejectLeaveDto }) =>
            hrService.rejectLeaveRequest(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.leaveDetail(id) });
            queryClient.invalidateQueries({ queryKey: hrKeys.leaves() });
            queryClient.invalidateQueries({ queryKey: hrKeys.pendingApprovals() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

export function useCancelLeaveRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hrService.cancelLeaveRequest(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.leaveDetail(id) });
            queryClient.invalidateQueries({ queryKey: hrKeys.leaves() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

// ============= ATTENDANCE HOOKS =============

export function useAttendance(params?: AttendanceListParams) {
    return useQuery({
        queryKey: hrKeys.attendanceList(params),
        queryFn: () => hrService.getAttendance(params),
    });
}

export function useMyAttendance(params?: { startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: hrKeys.myAttendance(params),
        queryFn: () => hrService.getMyAttendance(params),
    });
}

export function useTodayAttendance(departmentId?: string) {
    return useQuery({
        queryKey: hrKeys.todayAttendance(departmentId),
        queryFn: () => hrService.getTodayAttendance(departmentId),
    });
}

export function useMyTodayAttendance() {
    return useQuery({
        queryKey: hrKeys.myTodayAttendance(),
        queryFn: () => hrService.getMyTodayAttendance(),
    });
}

export function useAttendanceSummary(params: {
    employeeId?: string;
    departmentId?: string;
    month: number;
    year: number;
}) {
    return useQuery({
        queryKey: hrKeys.attendanceSummary(params),
        queryFn: () => hrService.getAttendanceSummary(params),
    });
}

export function useDailyAttendanceSummary(params?: {
    date?: string;
    departmentId?: string;
}) {
    return useQuery({
        queryKey: hrKeys.dailySummary(params),
        queryFn: () => hrService.getDailyAttendanceSummary(params),
    });
}

export function useCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CheckInDto) => hrService.checkIn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
            queryClient.invalidateQueries({ queryKey: hrKeys.myTodayAttendance() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

export function useCheckOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CheckOutDto) => hrService.checkOut(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.attendance() });
            queryClient.invalidateQueries({ queryKey: hrKeys.myTodayAttendance() });
            queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
        },
    });
}

// ============= DEPARTMENT HOOKS =============

export function useDepartments() {
    return useQuery({
        queryKey: hrKeys.departments(),
        queryFn: () => hrService.getDepartments(),
    });
}

export function useDepartment(id: string) {
    return useQuery({
        queryKey: hrKeys.departmentDetail(id),
        queryFn: () => hrService.getDepartment(id),
        enabled: !!id,
    });
}

export function useDepartmentTree() {
    return useQuery({
        queryKey: hrKeys.departmentTree(),
        queryFn: () => hrService.getDepartmentTree(),
    });
}

// ============= POSITION HOOKS =============

export function usePositions(departmentId?: string) {
    return useQuery({
        queryKey: hrKeys.positionList(departmentId),
        queryFn: () => hrService.getPositions(departmentId),
    });
}

export function usePosition(id: string) {
    return useQuery({
        queryKey: hrKeys.positionDetail(id),
        queryFn: () => hrService.getPosition(id),
        enabled: !!id,
    });
}

// ============= SHIFT HOOKS =============

export function useShifts() {
    return useQuery({
        queryKey: hrKeys.shifts(),
        queryFn: () => hrService.getShifts(),
    });
}

export function useShift(id: string) {
    return useQuery({
        queryKey: hrKeys.shiftDetail(id),
        queryFn: () => hrService.getShift(id),
        enabled: !!id,
    });
}

// ============= HOLIDAY HOOKS =============

export function useHolidays(year?: number) {
    return useQuery({
        queryKey: hrKeys.holidayList(year),
        queryFn: () => hrService.getHolidays(year),
    });
}

export function useUpcomingHolidays(limit?: number) {
    return useQuery({
        queryKey: [...hrKeys.upcomingHolidays(), limit],
        queryFn: () => hrService.getUpcomingHolidays(limit),
    });
}

// ============= DASHBOARD HOOKS =============

export function useHRStats() {
    return useQuery({
        queryKey: hrKeys.stats(),
        queryFn: () => hrService.getHRStats(),
    });
}

export function useHRDashboard() {
    return useQuery({
        queryKey: hrKeys.dashboard(),
        queryFn: () => hrService.getDashboardData(),
    });
}

// ============= ASSET HOOKS =============

export function useAssets(params?: AssetListParams) {
    return useQuery({
        queryKey: hrKeys.assetList(params),
        queryFn: () => hrService.getAssets(params),
    });
}

export function useAsset(id: string) {
    return useQuery({
        queryKey: hrKeys.assetDetail(id),
        queryFn: () => hrService.getAsset(id),
        enabled: !!id,
    });
}

export function useAssetCategories() {
    return useQuery({
        queryKey: hrKeys.assetCategories(),
        queryFn: () => hrService.getAssetCategories(),
    });
}

export function useEmployeeAssets(employeeId: string) {
    return useQuery({
        queryKey: hrKeys.employeeAssets(employeeId),
        queryFn: () => hrService.getEmployeeAssets(employeeId),
        enabled: !!employeeId,
    });
}

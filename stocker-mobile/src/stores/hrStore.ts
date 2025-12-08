import { create } from 'zustand';
import { apiService } from '../services/api';

// Types
export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    departmentId?: number;
    departmentName?: string;
    positionId?: number;
    positionName?: string;
    hireDate: string;
    isActive: boolean;
    avatarUrl?: string;
}

export interface Attendance {
    id: number;
    employeeId: number;
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
    totalHours?: number;
}

export interface Leave {
    id: number;
    employeeId: number;
    leaveTypeId: number;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    daysCount: number;
}

interface HRState {
    employees: Employee[];
    attendance: Attendance[];
    leaves: Leave[];
    todayAttendance: Attendance | null;

    isLoading: boolean;
    error: string | null;

    // Actions
    fetchEmployees: (params?: any) => Promise<void>;
    fetchAttendance: (params?: any) => Promise<void>;
    fetchLeaves: (params?: any) => Promise<void>;
    checkIn: (location?: string) => Promise<void>;
    checkOut: (location?: string) => Promise<void>;
    createLeave: (data: any) => Promise<void>;
    getDailyAttendance: (date: string) => Promise<void>;
}

export const useHRStore = create<HRState>((set, get) => ({
    employees: [],
    attendance: [],
    leaves: [],
    todayAttendance: null,

    isLoading: false,
    error: null,

    fetchEmployees: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.hr.getEmployees(params);
            if (response.data?.success) {
                set({ employees: response.data.data, isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
        }
    },

    fetchAttendance: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.hr.getAttendance(params);
            if (response.data?.success) {
                set({ attendance: response.data.data, isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
        }
    },

    fetchLeaves: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.hr.getLeaves(params);
            if (response.data?.success) {
                set({ leaves: response.data.data, isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
        }
    },

    checkIn: async (location) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.hr.checkIn({ location });
            if (response.data?.success) {
                // Refresh daily attendance
                const today = new Date().toISOString().split('T')[0];
                await get().getDailyAttendance(today);
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
            throw error;
        }
    },

    checkOut: async (location) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.hr.checkOut({ location });
            if (response.data?.success) {
                // Refresh daily attendance
                const today = new Date().toISOString().split('T')[0];
                await get().getDailyAttendance(today);
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
            throw error;
        }
    },

    createLeave: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.hr.createLeave(data);
            if (response.data?.success) {
                await get().fetchLeaves(); // Refresh list
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
            throw error;
        }
    },

    getDailyAttendance: async (date) => {
        try {
            const response = await apiService.hr.getDailyAttendance(date);
            if (response.data?.success) {
                set({ todayAttendance: response.data.data });
            }
        } catch (error) {
            console.error('Fetch daily attendance error:', error);
        }
    }
}));

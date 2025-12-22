import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
    token: {
        colorPrimary: '#0f172a', // Slate-900 (Corporate Black/Blue)
        colorInfo: '#0f172a',
        colorSuccess: '#10b981', // Emerald-500
        colorWarning: '#f59e0b', // Amber-500
        colorError: '#ef4444',   // Red-500
        borderRadius: 8,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        wireframe: false,
    },
    components: {
        Layout: {
            siderBg: '#ffffff', // Clean white sidebar by default
            headerBg: '#ffffff',
            bodyBg: '#f8fafc', // Slate-50 background path
        },
        Card: {
            borderRadiusLG: 12,
        },
        Button: {
            controlHeight: 40,
            paddingContentHorizontal: 20,
        },
        Input: {
            controlHeight: 42,
            paddingInline: 16,
        }
    }
};

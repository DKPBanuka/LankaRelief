import { defaultTheme } from 'react-admin';

export const adminTheme = {
    ...defaultTheme,
    palette: {
        mode: 'light' as 'light',
        primary: {
            main: '#2563eb', // blue-600
        },
        secondary: {
            main: '#dc2626', // red-600
        },
        background: {
            default: '#f3f4f6', // gray-100
        },
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
    components: {
        ...defaultTheme.components,
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.75rem', // rounded-xl
                    textTransform: 'none' as const,
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '1rem', // rounded-2xl
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // shadow-sm
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#1f2937', // gray-800
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: '#f9fafb', // gray-50
                },
            },
        },
    },
};

import { Layout, LayoutProps, AppBar } from 'react-admin';
import { Box, Typography, Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

const CustomAppBar = (props: any) => (
    <AppBar {...props} elevation={0}>
        <Box flex="1" display="flex" alignItems="center" gap={1}>
            <img src="/LankaRelief.png" alt="LankaRelief" style={{ width: 32, height: 32 }} />
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 'bold' }}>
                Lanka Relief Admin
            </Typography>
        </Box>
        <Button
            color="inherit"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => window.location.href = '/'}
            sx={{ textTransform: 'none', fontWeight: 600 }}
        >
            Back to App
        </Button>
    </AppBar>
);

export const CustomLayout = (props: LayoutProps) => (
    <Layout {...props} appBar={CustomAppBar} />
);

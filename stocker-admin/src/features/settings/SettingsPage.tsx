import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon,
} from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Sistem Ayarları
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistem ayarlarını yönetin ve yapılandırın
        </Typography>
      </Box>

      {/* Content */}
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <SettingsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Ayarlar Sayfası
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bu sayfa yakında gelecek. Sistem ayarları burada yapılandırılacak.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { School } from 'lucide-react';
import FrequencyProcessor from './components/FrequencyProcessor';
import StudentManager from './components/StudentManager';
import ScheduleGrid from './components/ScheduleGrid';
import AbsenceBoard from './components/AbsenceBoard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 0:
        return <FrequencyProcessor />;
      case 1:
        return <StudentManager />;
      case 2:
        return <ScheduleGrid />;
      case 3:
        return <AbsenceBoard />;
      default:
        return <FrequencyProcessor />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <School size={32} style={{ marginRight: 16 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Sistema de Frequência Escolar
            </Typography>
          </Toolbar>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ bgcolor: 'primary.dark' }}
          >
            <Tab label="Processar Frequência" />
            <Tab label="Gerenciar Alunos" />
            <Tab label="Grade de Horários" />
            <Tab label="Quadro de Faltas" />
          </Tabs>
        </AppBar>

        <Box sx={{ flexGrow: 1, bgcolor: 'grey.100' }}>
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

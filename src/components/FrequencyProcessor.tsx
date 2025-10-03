import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { Upload, FileText } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function FrequencyProcessor() {
  const [date, setDate] = useState('');
  const [frequenciaFile, setFrequenciaFile] = useState<File | null>(null);
  const [ausentesFile, setAusentesFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFrequenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFrequenciaFile(e.target.files[0]);
    }
  };

  const handleAusentesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAusentesFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!date) {
      setError('Por favor, selecione uma data');
      return;
    }

    if (!frequenciaFile && !ausentesFile) {
      setError('Por favor, selecione pelo menos um arquivo PDF');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('date', date);
      if (frequenciaFile) {
        formData.append('frequencia', frequenciaFile);
      }
      if (ausentesFile) {
        formData.append('ausentes', ausentesFile);
      }

      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao processar arquivos');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Processador de Frequência
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              type="date"
              label="Data"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFrequenciaChange}
                style={{ display: 'none' }}
                id="frequencia-upload"
              />
              <label htmlFor="frequencia-upload" style={{ cursor: 'pointer' }}>
                <FileText size={48} style={{ margin: '0 auto', display: 'block' }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  PDF de Frequência
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {frequenciaFile ? frequenciaFile.name : 'Clique para selecionar'}
                </Typography>
              </label>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleAusentesChange}
                style={{ display: 'none' }}
                id="ausentes-upload"
              />
              <label htmlFor="ausentes-upload" style={{ cursor: 'pointer' }}>
                <FileText size={48} style={{ margin: '0 auto', display: 'block' }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  PDF de Ausentes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ausentesFile ? ausentesFile.name : 'Clique para selecionar'}
                </Typography>
              </label>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleProcess}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
            >
              {loading ? 'Processando...' : 'Processar Arquivos'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success">
              {result.message}
            </Alert>
            {result.detalhes && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Detalhes do Processamento
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {result.detalhes.data}
                </Typography>
                <Typography variant="body2">
                  <strong>Dia da Semana:</strong> {result.detalhes.diaSemana}
                </Typography>
                <Typography variant="body2">
                  <strong>Total de Presentes:</strong> {result.detalhes.totalPresentes}
                </Typography>
                <Typography variant="body2">
                  <strong>Total de Ausentes:</strong> {result.detalhes.totalAusentes}
                </Typography>
                <Typography variant="body2">
                  <strong>Faltas Registradas:</strong> {result.detalhes.faltasRegistradas}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

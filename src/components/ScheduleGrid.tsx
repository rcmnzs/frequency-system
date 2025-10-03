import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

interface Horario {
  id: string;
  turma: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  disciplina: string;
}

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const horariosBase = [
  '07:00-08:00',
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00'
];

export default function ScheduleGrid() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [turmas, setTurmas] = useState<string[]>([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentHorario, setCurrentHorario] = useState<Partial<Horario>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTurmas();
  }, []);

  useEffect(() => {
    if (selectedTurma) {
      fetchHorarios();
    }
  }, [selectedTurma]);

  const fetchTurmas = async () => {
    try {
      const response = await fetch(`${API_URL}/horarios/turmas`);
      const data = await response.json();
      setTurmas(data);
      if (data.length > 0) setSelectedTurma(data[0]);
    } catch (err) {
      setError('Erro ao carregar turmas');
    }
  };

  const fetchHorarios = async () => {
    if (!selectedTurma) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/horarios?turma=${selectedTurma}`);
      const data = await response.json();
      setHorarios(data);
    } catch (err) {
      setError('Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (dia?: string, horario?: string, existing?: Horario) => {
    if (existing) {
      setEditMode(true);
      setCurrentHorario(existing);
    } else {
      setEditMode(false);
      const [hora_inicio, hora_fim] = horario?.split('-') || ['', ''];
      setCurrentHorario({
        turma: selectedTurma,
        dia_semana: dia || '',
        hora_inicio,
        hora_fim,
        disciplina: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentHorario({});
    setError('');
  };

  const handleSave = async () => {
    if (!currentHorario.turma || !currentHorario.dia_semana || !currentHorario.hora_inicio ||
        !currentHorario.hora_fim || !currentHorario.disciplina) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      const url = editMode
        ? `${API_URL}/horarios/${currentHorario.id}`
        : `${API_URL}/horarios`;

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentHorario),
      });

      if (!response.ok) throw new Error('Erro ao salvar horário');

      await fetchHorarios();
      handleCloseDialog();
    } catch (err) {
      setError('Erro ao salvar horário');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;

    try {
      const response = await fetch(`${API_URL}/horarios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir horário');

      await fetchHorarios();
    } catch (err) {
      setError('Erro ao excluir horário');
    }
  };

  const getHorarioForCell = (dia: string, horario: string) => {
    const [inicio, fim] = horario.split('-');
    return horarios.find(
      h => h.dia_semana === dia && h.hora_inicio === inicio && h.hora_fim === fim
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Grade de Horários
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Turma</InputLabel>
            <Select
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              label="Turma"
            >
              {turmas.map((turma) => (
                <MenuItem key={turma} value={turma}>
                  {turma}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Horário
                </TableCell>
                {diasSemana.map((dia) => (
                  <TableCell
                    key={dia}
                    align="center"
                    sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}
                  >
                    {dia}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {horariosBase.map((horario) => (
                <TableRow key={horario}>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                    {horario}
                  </TableCell>
                  {diasSemana.map((dia) => {
                    const horarioData = getHorarioForCell(dia, horario);
                    return (
                      <TableCell
                        key={`${dia}-${horario}`}
                        align="center"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          position: 'relative'
                        }}
                        onClick={() => !horarioData && handleOpenDialog(dia, horario)}
                      >
                        {horarioData ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {horarioData.disciplina}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDialog(undefined, undefined, horarioData);
                                }}
                              >
                                <Edit size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(horarioData.id);
                                }}
                              >
                                <Trash2 size={14} />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <IconButton size="small">
                            <Plus size={16} />
                          </IconButton>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Horário' : 'Adicionar Horário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Dia da Semana</InputLabel>
              <Select
                value={currentHorario.dia_semana || ''}
                onChange={(e) => setCurrentHorario({ ...currentHorario, dia_semana: e.target.value })}
                label="Dia da Semana"
              >
                {diasSemana.map((dia) => (
                  <MenuItem key={dia} value={dia}>
                    {dia}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Hora Início"
              type="time"
              value={currentHorario.hora_inicio || ''}
              onChange={(e) => setCurrentHorario({ ...currentHorario, hora_inicio: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hora Fim"
              type="time"
              value={currentHorario.hora_fim || ''}
              onChange={(e) => setCurrentHorario({ ...currentHorario, hora_fim: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Disciplina"
              value={currentHorario.disciplina || ''}
              onChange={(e) => setCurrentHorario({ ...currentHorario, disciplina: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

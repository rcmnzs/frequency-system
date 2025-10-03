import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
  IconButton
} from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

interface Aluno {
  matricula: string;
  nome: string;
  turma: string;
}

export default function StudentManager() {
  const [alunos, setAlunos] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAluno, setCurrentAluno] = useState<Aluno>({ matricula: '', nome: '', turma: '' });
  const [originalMatricula, setOriginalMatricula] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/alunos`);
      const data = await response.json();
      setAlunos(data.map((a: Aluno) => ({ ...a, id: a.matricula })));
    } catch (err) {
      setError('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (aluno?: Aluno) => {
    if (aluno) {
      setEditMode(true);
      setCurrentAluno(aluno);
      setOriginalMatricula(aluno.matricula);
    } else {
      setEditMode(false);
      setCurrentAluno({ matricula: '', nome: '', turma: '' });
      setOriginalMatricula('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAluno({ matricula: '', nome: '', turma: '' });
    setError('');
  };

  const handleSave = async () => {
    if (!currentAluno.matricula || !currentAluno.nome || !currentAluno.turma) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      const url = editMode
        ? `${API_URL}/alunos/${originalMatricula}`
        : `${API_URL}/alunos`;

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentAluno),
      });

      if (!response.ok) throw new Error('Erro ao salvar aluno');

      await fetchAlunos();
      handleCloseDialog();
    } catch (err) {
      setError('Erro ao salvar aluno');
    }
  };

  const handleDelete = async (matricula: string) => {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

    try {
      const response = await fetch(`${API_URL}/alunos/${matricula}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir aluno');

      await fetchAlunos();
    } catch (err) {
      setError('Erro ao excluir aluno');
    }
  };

  const columns: GridColDef[] = [
    { field: 'matricula', headerName: 'Matrícula', width: 150 },
    { field: 'nome', headerName: 'Nome', width: 300, flex: 1 },
    { field: 'turma', headerName: 'Turma', width: 150 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row as Aluno)}
            color="primary"
          >
            <Edit size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.matricula)}
            color="error"
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredAlunos = alunos.filter((aluno: any) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.turma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Gerenciar Alunos
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => handleOpenDialog()}
          >
            Adicionar Aluno
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Buscar alunos"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredAlunos}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Aluno' : 'Adicionar Aluno'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Matrícula"
              value={currentAluno.matricula}
              onChange={(e) => setCurrentAluno({ ...currentAluno, matricula: e.target.value })}
              fullWidth
            />
            <TextField
              label="Nome"
              value={currentAluno.nome}
              onChange={(e) => setCurrentAluno({ ...currentAluno, nome: e.target.value })}
              fullWidth
            />
            <TextField
              label="Turma"
              value={currentAluno.turma}
              onChange={(e) => setCurrentAluno({ ...currentAluno, turma: e.target.value })}
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

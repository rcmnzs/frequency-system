import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
  Chip
} from '@mui/material';

interface Falta {
  matricula_aluno: string;
  disciplina: string;
  total_faltas: number;
}

interface AlunoFaltas {
  matricula: string;
  nome: string;
  turma: string;
  faltas: { [disciplina: string]: number };
}

export default function AbsenceBoard() {
  const [dados, setDados] = useState<AlunoFaltas[]>([]);
  const [busca, setBusca] = useState('');
  const [disciplinas, setDisciplinas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quadro-de-faltas');
      const data = await response.json();
      
      setDados(data.alunos || []);
      setDisciplinas(data.disciplinas || []);
    } catch (error) {
      console.error('Erro ao carregar quadro de faltas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFaltasColor = (faltas: number) => {
    if (faltas === 0) return 'success';
    if (faltas <= 5) return 'warning';
    return 'error';
  };

  const dadosFiltrados = dados.filter(aluno =>
    aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.matricula.includes(busca) ||
    aluno.turma.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quadro de Faltas
      </Typography>

      <TextField
        fullWidth
        label="Buscar aluno"
        variant="outlined"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Matrícula</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Turma</TableCell>
              {disciplinas.map((disc) => (
                <TableCell key={disc} align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                  {disc}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dadosFiltrados.map((aluno) => (
              <TableRow key={aluno.matricula}>
                <TableCell>{aluno.matricula}</TableCell>
                <TableCell>{aluno.nome}</TableCell>
                <TableCell>{aluno.turma}</TableCell>
                {disciplinas.map((disc) => {
                  const faltas = aluno.faltas[disc] || 0;
                  return (
                    <TableCell key={disc} align="center">
                      <Chip
                        label={faltas}
                        color={getFaltasColor(faltas)}
                        size="small"
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {dadosFiltrados.length === 0 && (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Nenhum aluno encontrado
        </Typography>
      )}
    </Box>
  );
}
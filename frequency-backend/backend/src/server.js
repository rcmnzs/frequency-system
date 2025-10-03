const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config({ path: '../../.env' });

const { extractPdfFrequencia, extractPdfAusentes } = require('./services/pdfService');
const studentService = require('./services/studentService');
const scheduleService = require('./services/scheduleService');
const frequencyService = require('./services/frequencyService');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to get day of week in Portuguese
function getDayOfWeek(date) {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[date.getDay()];
}

// ========== STATS ENDPOINT ==========
app.get('/api/stats', async (req, res) => {
  try {
    const alunos = await studentService.getAllAlunos();
    const horarios = await scheduleService.getAllHorarios();
    const turmas = await scheduleService.getAllTurmas();

    res.json({
      totalAlunos: alunos.length,
      totalHorarios: horarios.length,
      totalTurmas: turmas.length
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// ========== PROCESS PDF ENDPOINT ==========
app.post('/api/process', upload.fields([
  { name: 'frequencia', maxCount: 1 },
  { name: 'ausentes', maxCount: 1 }
]), async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const frequenciaFile = req.files['frequencia'] ? req.files['frequencia'][0] : null;
    const ausentesFile = req.files['ausentes'] ? req.files['ausentes'][0] : null;

    if (!frequenciaFile && !ausentesFile) {
      return res.status(400).json({ error: 'At least one PDF file is required' });
    }

    // Parse date and get day of week
    const dataProcessamento = new Date(date);
    const diaSemana = getDayOfWeek(dataProcessamento);

    // Extract data from PDFs
    let presentes = [];
    let ausentes = [];

    if (frequenciaFile) {
      const frequenciaData = await extractPdfFrequencia(frequenciaFile.buffer);
      presentes = frequenciaData
        .filter(r => r.sentido === 'Entrada')
        .map(r => r.matricula);
    }

    if (ausentesFile) {
      const ausentesData = await extractPdfAusentes(ausentesFile.buffer);
      ausentes = ausentesData.map(a => a.matricula);
    }

    // Get all students
    const todosAlunos = await studentService.getAllAlunos();

    // Determine who was absent
    const matriculasAusentes = todosAlunos
      .map(a => a.matricula)
      .filter(m => !presentes.includes(m) || ausentes.includes(m));

    // Process absences by discipline
    const faltasPorDisciplina = [];

    for (const matricula of matriculasAusentes) {
      const aluno = await studentService.getAlunoByMatricula(matricula);
      if (!aluno) continue;

      // Get all schedules for this student's turma on this day
      const horariosAluno = await scheduleService.getHorariosByTurma(aluno.turma);
      const horariosDia = horariosAluno.filter(h => h.dia_semana === diaSemana);

      // Register absence for each discipline
      for (const horario of horariosDia) {
        faltasPorDisciplina.push({
          matricula: aluno.matricula,
          nome: aluno.nome,
          turma: aluno.turma,
          disciplina: horario.disciplina,
          data: date
        });
      }
    }

    // Register all absences in database
    let registrosAtualizados = 0;
    for (const falta of faltasPorDisciplina) {
      await frequencyService.registrarFalta(falta.matricula, falta.disciplina);
      registrosAtualizados++;
    }

    res.json({
      message: `Processamento concluído. ${registrosAtualizados} registros de falta foram atualizados no banco de dados.`,
      detalhes: {
        totalPresentes: presentes.length,
        totalAusentes: matriculasAusentes.length,
        faltasRegistradas: registrosAtualizados,
        data: date,
        diaSemana: diaSemana
      }
    });
  } catch (error) {
    console.error('Error processing PDFs:', error);
    res.status(500).json({ error: 'Failed to process PDF files', details: error.message });
  }
});

// ========== ALUNOS ENDPOINTS ==========
app.get('/api/alunos', async (req, res) => {
  try {
    const alunos = await studentService.getAllAlunos();
    res.json(alunos);
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ error: 'Failed to get students' });
  }
});

app.get('/api/alunos/:matricula', async (req, res) => {
  try {
    const aluno = await studentService.getAlunoByMatricula(req.params.matricula);
    if (!aluno) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(aluno);
  } catch (error) {
    console.error('Error getting student:', error);
    res.status(500).json({ error: 'Failed to get student' });
  }
});

app.post('/api/alunos', async (req, res) => {
  try {
    const { matricula, nome, turma } = req.body;

    if (!matricula || !nome || !turma) {
      return res.status(400).json({ error: 'Matricula, nome, and turma are required' });
    }

    const aluno = await studentService.createAluno({ matricula, nome, turma });
    res.status(201).json(aluno);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.put('/api/alunos/:matricula', async (req, res) => {
  try {
    const oldMatricula = req.params.matricula;
    const { matricula, nome, turma } = req.body;

    if (!matricula || !nome || !turma) {
      return res.status(400).json({ error: 'Matricula, nome, and turma are required' });
    }

    const aluno = await studentService.updateAlunoCompleto(oldMatricula, { matricula, nome, turma });
    res.json(aluno);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.delete('/api/alunos/:matricula', async (req, res) => {
  try {
    await studentService.deleteAluno(req.params.matricula);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// ========== HORARIOS ENDPOINTS ==========
app.get('/api/horarios', async (req, res) => {
  try {
    const { turma } = req.query;
    let horarios;

    if (turma) {
      horarios = await scheduleService.getHorariosByTurma(turma);
    } else {
      horarios = await scheduleService.getAllHorarios();
    }

    res.json(horarios);
  } catch (error) {
    console.error('Error getting schedules:', error);
    res.status(500).json({ error: 'Failed to get schedules' });
  }
});

app.get('/api/horarios/turmas', async (req, res) => {
  try {
    const turmas = await scheduleService.getAllTurmas();
    res.json(turmas);
  } catch (error) {
    console.error('Error getting turmas:', error);
    res.status(500).json({ error: 'Failed to get turmas' });
  }
});

app.get('/api/horarios/:id', async (req, res) => {
  try {
    const horario = await scheduleService.getHorarioById(req.params.id);
    if (!horario) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(horario);
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

app.post('/api/horarios', async (req, res) => {
  try {
    const { turma, dia_semana, hora_inicio, hora_fim, disciplina } = req.body;

    if (!turma || !dia_semana || !hora_inicio || !hora_fim || !disciplina) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const horario = await scheduleService.createHorario({
      turma,
      dia_semana,
      hora_inicio,
      hora_fim,
      disciplina
    });

    res.status(201).json(horario);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

app.put('/api/horarios/:id', async (req, res) => {
  try {
    const { turma, dia_semana, hora_inicio, hora_fim, disciplina } = req.body;

    if (!turma || !dia_semana || !hora_inicio || !hora_fim || !disciplina) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const horario = await scheduleService.updateHorario(req.params.id, {
      turma,
      dia_semana,
      hora_inicio,
      hora_fim,
      disciplina
    });

    res.json(horario);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

app.delete('/api/horarios/:id', async (req, res) => {
  try {
    await scheduleService.deleteHorario(req.params.id);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// ========== QUADRO DE FALTAS ENDPOINT ==========
app.get('/api/quadro-de-faltas', async (req, res) => {
  try {
    const quadro = await frequencyService.getQuadroDeFaltas();
    res.json(quadro);
  } catch (error) {
    console.error('Error getting absence board:', error);
    res.status(500).json({ error: 'Failed to get absence board' });
  }
});

// ========== FALTAS BY ALUNO ENDPOINT ==========
app.get('/api/faltas/:matricula', async (req, res) => {
  try {
    const faltas = await frequencyService.getFaltasByAluno(req.params.matricula);
    res.json(faltas);
  } catch (error) {
    console.error('Error getting student absences:', error);
    res.status(500).json({ error: 'Failed to get student absences' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

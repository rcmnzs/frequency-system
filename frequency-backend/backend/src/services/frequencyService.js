const supabase = require('../database/supabase');

/**
 * Register an absence for a student in a specific discipline
 */
async function registrarFalta(matriculaAluno, disciplina) {
  try {
    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from('faltas_disciplina')
      .select('*')
      .eq('matricula_aluno', matriculaAluno)
      .eq('disciplina', disciplina)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('faltas_disciplina')
        .update({
          total_faltas: existing.total_faltas + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('faltas_disciplina')
        .insert([{
          matricula_aluno: matriculaAluno,
          disciplina: disciplina,
          total_faltas: 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error registering absence:', error);
    throw error;
  }
}

/**
 * Get complete absence board for all students
 */
async function getQuadroDeFaltas() {
  try {
    // Get all absences with student data
    const { data: faltas, error: faltasError } = await supabase
      .from('faltas_disciplina')
      .select(`
        *,
        alunos (
          matricula,
          nome,
          turma
        )
      `)
      .order('matricula_aluno');

    if (faltasError) throw faltasError;

    // Get all students to include those with no absences
    const { data: alunos, error: alunosError } = await supabase
      .from('alunos')
      .select('*')
      .order('nome');

    if (alunosError) throw alunosError;

    // Get all unique disciplines
    const { data: disciplinas, error: discError } = await supabase
      .from('horarios')
      .select('disciplina')
      .order('disciplina');

    if (discError) throw discError;

    const uniqueDisciplinas = [...new Set(disciplinas.map(d => d.disciplina))];

    // Build the board
    const quadro = alunos.map(aluno => {
      const alunoFaltas = faltas.filter(f => f.matricula_aluno === aluno.matricula);

      const faltasPorDisciplina = {};
      uniqueDisciplinas.forEach(disc => {
        const falta = alunoFaltas.find(f => f.disciplina === disc);
        faltasPorDisciplina[disc] = falta ? falta.total_faltas : 0;
      });

      return {
        matricula: aluno.matricula,
        nome: aluno.nome,
        turma: aluno.turma,
        faltas: faltasPorDisciplina
      };
    });

    return {
      quadro,
      disciplinas: uniqueDisciplinas
    };
  } catch (error) {
    console.error('Error getting absence board:', error);
    throw error;
  }
}

/**
 * Get absences for a specific student
 */
async function getFaltasByAluno(matriculaAluno) {
  const { data, error } = await supabase
    .from('faltas_disciplina')
    .select('*')
    .eq('matricula_aluno', matriculaAluno)
    .order('disciplina');

  if (error) throw error;
  return data;
}

/**
 * Reset absences for a student in a discipline
 */
async function resetFaltas(matriculaAluno, disciplina) {
  const { data, error } = await supabase
    .from('faltas_disciplina')
    .update({ total_faltas: 0, updated_at: new Date().toISOString() })
    .eq('matricula_aluno', matriculaAluno)
    .eq('disciplina', disciplina)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  registrarFalta,
  getQuadroDeFaltas,
  getFaltasByAluno,
  resetFaltas
};

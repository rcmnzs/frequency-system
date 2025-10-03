const supabase = require('../database/supabase');

/**
 * Get all students
 */
async function getAllAlunos() {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .order('nome');

  if (error) throw error;
  return data;
}

/**
 * Get student by matricula
 */
async function getAlunoByMatricula(matricula) {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('matricula', matricula)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Find student by fuzzy match
 */
async function findStudentMatch(matricula, nome) {
  // Try exact matricula match first
  let { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('matricula', matricula)
    .maybeSingle();

  if (data) return data;

  // Try partial name match
  const { data: nameMatches, error: nameError } = await supabase
    .from('alunos')
    .select('*')
    .ilike('nome', `%${nome}%`);

  if (nameError) throw nameError;

  if (nameMatches && nameMatches.length > 0) {
    return nameMatches[0];
  }

  return null;
}

/**
 * Create new student
 */
async function createAluno(alunoData) {
  const { data, error } = await supabase
    .from('alunos')
    .insert([alunoData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update student
 */
async function updateAluno(matricula, alunoData) {
  const { data, error } = await supabase
    .from('alunos')
    .update(alunoData)
    .eq('matricula', matricula)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update student including matricula change
 */
async function updateAlunoCompleto(oldMatricula, newData) {
  // If matricula changed, we need to handle it carefully
  if (oldMatricula !== newData.matricula) {
    // Delete old record
    await deleteAluno(oldMatricula);
    // Create new record with new matricula
    return await createAluno(newData);
  } else {
    return await updateAluno(oldMatricula, newData);
  }
}

/**
 * Delete student
 */
async function deleteAluno(matricula) {
  const { error } = await supabase
    .from('alunos')
    .delete()
    .eq('matricula', matricula);

  if (error) throw error;
  return true;
}

/**
 * Get students by turma
 */
async function getAlunosByTurma(turma) {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('turma', turma)
    .order('nome');

  if (error) throw error;
  return data;
}

module.exports = {
  getAllAlunos,
  getAlunoByMatricula,
  findStudentMatch,
  createAluno,
  updateAluno,
  updateAlunoCompleto,
  deleteAluno,
  getAlunosByTurma
};

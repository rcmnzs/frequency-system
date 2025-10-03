const supabase = require('../database/supabase');

/**
 * Get all schedules
 */
async function getAllHorarios() {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .order('turma, dia_semana, hora_inicio');

  if (error) throw error;
  return data;
}

/**
 * Get schedule by ID
 */
async function getHorarioById(id) {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get schedules by turma
 */
async function getHorariosByTurma(turma) {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('turma', turma)
    .order('dia_semana, hora_inicio');

  if (error) throw error;
  return data;
}

/**
 * Get schedule for specific turma, day, and time
 */
async function getHorarioByTurmaAndTime(turma, diaSemana, hora) {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('turma', turma)
    .eq('dia_semana', diaSemana)
    .lte('hora_inicio', hora)
    .gte('hora_fim', hora)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Create new schedule
 */
async function createHorario(horarioData) {
  const { data, error } = await supabase
    .from('horarios')
    .insert([horarioData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update schedule
 */
async function updateHorario(id, horarioData) {
  const { data, error } = await supabase
    .from('horarios')
    .update(horarioData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete schedule
 */
async function deleteHorario(id) {
  const { error } = await supabase
    .from('horarios')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Get all unique turmas from schedules
 */
async function getAllTurmas() {
  const { data, error } = await supabase
    .from('horarios')
    .select('turma')
    .order('turma');

  if (error) throw error;

  // Extract unique turmas
  const uniqueTurmas = [...new Set(data.map(h => h.turma))];
  return uniqueTurmas;
}

module.exports = {
  getAllHorarios,
  getHorarioById,
  getHorariosByTurma,
  getHorarioByTurmaAndTime,
  createHorario,
  updateHorario,
  deleteHorario,
  getAllTurmas
};

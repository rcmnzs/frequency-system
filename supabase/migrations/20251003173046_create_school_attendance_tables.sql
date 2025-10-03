/*
  # School Attendance System Database Schema

  1. New Tables
    - `alunos` (students)
      - `matricula` (text, primary key) - Student enrollment ID
      - `nome` (text, not null) - Student name
      - `turma` (text, not null) - Class/grade
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `horarios` (schedules)
      - `id` (uuid, primary key) - Schedule entry ID
      - `turma` (text, not null) - Class/grade
      - `dia_semana` (text, not null) - Day of week
      - `hora_inicio` (text, not null) - Start time
      - `hora_fim` (text, not null) - End time
      - `disciplina` (text, not null) - Subject/discipline
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `faltas_disciplina` (absences by discipline)
      - `id` (uuid, primary key) - Record ID
      - `matricula_aluno` (text, not null) - Student enrollment ID (FK)
      - `disciplina` (text, not null) - Subject/discipline
      - `total_faltas` (integer, default 0) - Total absences count
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
    
  3. Indexes
    - Unique index on (matricula_aluno, disciplina) in faltas_disciplina
    - Index on turma in alunos and horarios for faster filtering
*/

-- Create alunos table
CREATE TABLE IF NOT EXISTS alunos (
  matricula text PRIMARY KEY,
  nome text NOT NULL,
  turma text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create horarios table
CREATE TABLE IF NOT EXISTS horarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma text NOT NULL,
  dia_semana text NOT NULL,
  hora_inicio text NOT NULL,
  hora_fim text NOT NULL,
  disciplina text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create faltas_disciplina table
CREATE TABLE IF NOT EXISTS faltas_disciplina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_aluno text NOT NULL,
  disciplina text NOT NULL,
  total_faltas integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (matricula_aluno) REFERENCES alunos (matricula) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos (turma);
CREATE INDEX IF NOT EXISTS idx_horarios_turma ON horarios (turma);
CREATE UNIQUE INDEX IF NOT EXISTS idx_aluno_disciplina ON faltas_disciplina (matricula_aluno, disciplina);

-- Enable RLS
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE faltas_disciplina ENABLE ROW LEVEL SECURITY;

-- Create policies for alunos
CREATE POLICY "Allow authenticated users to read alunos"
  ON alunos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert alunos"
  ON alunos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update alunos"
  ON alunos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete alunos"
  ON alunos FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for horarios
CREATE POLICY "Allow authenticated users to read horarios"
  ON horarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert horarios"
  ON horarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update horarios"
  ON horarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete horarios"
  ON horarios FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for faltas_disciplina
CREATE POLICY "Allow authenticated users to read faltas_disciplina"
  ON faltas_disciplina FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert faltas_disciplina"
  ON faltas_disciplina FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update faltas_disciplina"
  ON faltas_disciplina FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete faltas_disciplina"
  ON faltas_disciplina FOR DELETE
  TO authenticated
  USING (true);
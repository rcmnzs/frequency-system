const pdfParse = require('pdf-parse');

/**
 * Extract attendance data from frequency PDF
 * Expected format: Crachá, Nome, Data, Hora, Sentido (Entrada/Saída), Estado
 */
async function extractPdfFrequencia(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;

    const registros = [];
    const lines = text.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Try to match patterns for matricula, nome, and sentido (Entrada/Saída)
      // Pattern: matricula (numbers/text), name, date, time, direction
      const entradaMatch = line.match(/(\d+)\s+([A-Za-zÀ-ÿ\s]+)\s+\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\s+Entrada/i);
      const saidaMatch = line.match(/(\d+)\s+([A-Za-zÀ-ÿ\s]+)\s+\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\s+Saída/i);

      if (entradaMatch) {
        registros.push({
          matricula: entradaMatch[1].trim(),
          nome: entradaMatch[2].trim(),
          sentido: 'Entrada'
        });
      } else if (saidaMatch) {
        registros.push({
          matricula: saidaMatch[1].trim(),
          nome: saidaMatch[2].trim(),
          sentido: 'Saída'
        });
      }
    }

    return registros;
  } catch (error) {
    console.error('Error extracting frequency PDF:', error);
    throw new Error('Failed to extract data from frequency PDF');
  }
}

/**
 * Extract absent students list from ausentes PDF
 * Expected format: Matrícula, Nome
 */
async function extractPdfAusentes(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;

    const ausentes = [];
    const lines = text.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Try to match patterns for matricula and nome
      // Pattern: matricula (numbers), name
      const match = line.match(/^(\d+)\s+([A-Za-zÀ-ÿ\s]+)$/);

      if (match) {
        ausentes.push({
          matricula: match[1].trim(),
          nome: match[2].trim()
        });
      }
    }

    return ausentes;
  } catch (error) {
    console.error('Error extracting ausentes PDF:', error);
    throw new Error('Failed to extract data from ausentes PDF');
  }
}

module.exports = {
  extractPdfFrequencia,
  extractPdfAusentes
};

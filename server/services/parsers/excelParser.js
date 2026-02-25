const XLSX = require('xlsx');

/**
 * Extract text from Excel (.xlsx/.xls) buffer
 * Reads all sheets, joins cell values row by row
 * @param {Buffer} buffer - Excel file buffer
 * @returns {string} Extracted text
 */
function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const lines = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    for (const row of rows) {
      const line = row
        .map((cell) => String(cell).trim())
        .filter(Boolean)
        .join(' | ');
      if (line) lines.push(line);
    }
  }

  return lines.join('\n');
}

module.exports = parseExcel;

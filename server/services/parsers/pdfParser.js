const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function parsePdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text || '';
}

module.exports = parsePdf;

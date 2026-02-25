const parsePdf = require('./pdfParser');
const parseWord = require('./wordParser');
const parseExcel = require('./excelParser');
const parseImage = require('./imageParser');

/**
 * Route file buffer to the correct parser based on MIME type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} Extracted text
 */
async function parseFile(buffer, mimetype) {
  switch (mimetype) {
    case 'application/pdf':
      return await parsePdf(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return await parseWord(buffer);

    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return parseExcel(buffer);

    case 'image/jpeg':
    case 'image/png':
      return await parseImage(buffer);

    default:
      throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

module.exports = { parseFile };

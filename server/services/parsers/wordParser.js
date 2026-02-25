const mammoth = require('mammoth');

/**
 * Extract text from Word (.docx) buffer
 * @param {Buffer} buffer - Word file buffer
 * @returns {Promise<string>} Extracted text
 */
async function parseWord(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

module.exports = parseWord;

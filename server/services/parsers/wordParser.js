const mammoth = require('mammoth');

/**
 * Extract text from Word (.docx) buffer
 * @param {Buffer} buffer - Word file buffer
 * @returns {Promise<string>} Extracted text
 */
async function parseWord(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (err) {
    console.warn('Mammoth parse failed, falling back to raw text (for rtf/old doc):', err.message);
    // Fallback: nếu không phải docx chuẩn (VD: file rtf đổi đuôi thành .doc)
    // Thì đọc trực tiếp chuỗi text từ buffer để AI tự xử lý các thẻ
    return buffer.toString('utf-8');
  }
}

module.exports = parseWord;

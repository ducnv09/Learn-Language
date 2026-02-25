const Tesseract = require('tesseract.js');

/**
 * Extract text from image buffer using Tesseract OCR
 * @param {Buffer} buffer - Image file buffer (JPG/PNG)
 * @returns {Promise<string>} Extracted text
 */
async function parseImage(buffer) {
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng+vie', {
    logger: (info) => {
      if (info.status === 'recognizing text') {
        console.log(`  OCR progress: ${(info.progress * 100).toFixed(0)}%`);
      }
    },
  });
  return text || '';
}

module.exports = parseImage;

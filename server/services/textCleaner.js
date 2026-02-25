/**
 * Text cleaning and normalization utilities
 * Clean raw extracted text before sending to AI
 */

/**
 * Remove excessive whitespace, blank lines, and normalize spacing
 */
function normalizeWhitespace(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Remove common OCR artifacts and noise characters
 */
function cleanOcrArtifacts(text) {
  return text
    .replace(/[|]{2,}/g, '')
    .replace(/[_]{3,}/g, '')
    .replace(/[=]{3,}/g, '')
    .replace(/[~]{3,}/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // control chars
    .trim();
}

/**
 * Extract lines that likely contain vocabulary
 * Filters out very short lines and lines that are just numbers/symbols
 */
function extractMeaningfulLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (line.length < 2) return false;
      if (/^[\d\s.,;:!?()[\]{}]+$/.test(line)) return false;
      if (/^[-=_*#~]+$/.test(line)) return false;
      return true;
    })
    .join('\n');
}

/**
 * Full cleaning pipeline: normalize → clean artifacts → extract meaningful content
 */
function cleanText(text) {
  let result = normalizeWhitespace(text);
  result = cleanOcrArtifacts(result);
  result = extractMeaningfulLines(result);
  return result;
}

/**
 * Truncate text to fit within AI token limits
 * ~4 chars per token, keep under limit
 */
function truncateForAI(text, maxChars = 12000) {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n\n[... truncated]';
}

module.exports = {
  normalizeWhitespace,
  cleanOcrArtifacts,
  extractMeaningfulLines,
  cleanText,
  truncateForAI,
};

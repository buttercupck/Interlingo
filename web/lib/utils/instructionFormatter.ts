/**
 * Instruction Formatter Utilities
 *
 * Grade A formatting logic extracted from the Intercom renderer.
 * These pure functions transform database instruction text into clean,
 * professional email content with proper placeholder substitution.
 *
 * Quality improvements:
 * - Substitutes [Language Name] and [Interpreter Full Name] placeholders
 * - Removes wikilinks [[like this]]
 * - Cleans markdown formatting (bold, italic)
 * - Handles both {{LANGUAGE}} (old style) and [Language Name] (Grade A style)
 */

/**
 * Substitute all placeholder variations with actual values
 *
 * Handles multiple placeholder formats:
 * - [Language Name] → Spanish
 * - [Interpreter Full Name] → John Doe
 * - [Interpreter Name] → John Doe
 * - [LANGUAGE] → SPANISH
 * - [language] → spanish
 * - {{LANGUAGE}} → SPANISH (legacy format)
 *
 * @param text - Raw instruction text
 * @param language - Language being interpreted (e.g., "Spanish")
 * @param interpreterName - Full interpreter name (e.g., "John Doe")
 * @returns Text with all placeholders substituted
 */
export function substitutePlaceholders(
  text: string,
  language: string,
  interpreterName?: string
): string {
  return text
    // Grade A placeholders
    .replace(/\[Language Name\]/g, language)
    .replace(/\[Interpreter Full Name\]/g, interpreterName || 'Interpreter')
    .replace(/\[Interpreter Name\]/g, interpreterName || 'Interpreter')
    .replace(/\[LANGUAGE\]/g, language.toUpperCase())
    .replace(/\[language\]/g, language.toLowerCase())
    // Legacy placeholders
    .replace(/{{LANGUAGE}}/g, language.toUpperCase())
    .replace(/{{language}}/g, language.toLowerCase());
}

/**
 * Clean markdown formatting and remove technical artifacts
 *
 * Removes:
 * - [[Wikilinks]]
 * - ****quad bold****
 * - **bold**
 * - __italic__
 * - *italic*
 * - Extra whitespace
 *
 * @param text - Text with markdown formatting
 * @returns Clean plain text suitable for email
 */
export function cleanMarkdown(text: string): string {
  return text
    // Remove wikilinks [[like this]]
    .replace(/\[\[([^\]]+)\]\]/g, '')
    // Remove quad bold (****text****)
    .replace(/\*\*\*\*([^*]+)\*\*\*\*/g, '$1')
    // Remove bold (**text**)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Remove italic (__text__)
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic (*text*)
    .replace(/\*([^*]+)\*/g, '$1')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up multiple newlines (keep max 2)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Apply Grade A formatting to instruction text
 *
 * Combines placeholder substitution and markdown cleaning for
 * professional, clean email content.
 *
 * @param instructions - Raw instruction text from database
 * @param language - Language being interpreted
 * @param interpreterName - Full interpreter name (optional)
 * @returns Grade A formatted instruction text
 */
export function formatInstructionsGradeA(
  instructions: string,
  language: string,
  interpreterName?: string
): string {
  if (!instructions) return '';

  // Step 1: Substitute placeholders
  const withPlaceholders = substitutePlaceholders(instructions, language, interpreterName);

  // Step 2: Clean markdown formatting
  const cleaned = cleanMarkdown(withPlaceholders);

  return cleaned;
}

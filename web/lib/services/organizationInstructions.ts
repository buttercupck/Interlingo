/**
 * Organization Instructions Service
 *
 * Implements three-layer template resolution system:
 * - Layer 1: Base email template (REQ/CONF/REM)
 * - Layer 2: Standard modality instructions (Zoom/In-Person/Phone defaults)
 * - Layer 3: Organization-specific instructions (overrides Layer 2)
 *
 * This provides smart fallback where organization-specific instructions
 * override standard modality instructions when they exist.
 */

import { createClient } from '@/lib/supabase/client';
import { formatInstructionsGradeA } from '@/lib/utils/instructionFormatter';

export interface OrgInstructions {
  zoom_instructions?: string | null;
  in_person_instructions?: string | null;
  phone_instructions?: string | null;
}

/**
 * Fetch organization instructions from database (Layer 3)
 */
export async function getOrgInstructions(orgId: string): Promise<OrgInstructions> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('zoom_instructions, in_person_instructions, phone_instructions')
    .eq('id', orgId)
    .single();

  if (error || !data) {
    console.warn(`Could not load org instructions for ${orgId}:`, error?.message);
    return {}; // Return empty config to trigger Layer 2 fallback
  }

  return data;
}

/**
 * Get standard modality instructions (Layer 2 - Fallback)
 *
 * These are used when no organization-specific instructions exist.
 * Based on templates in /standard-modality-instructions/
 */
function getStandardModalityInstructions(modality: string, language: string): string {
  if (modality === 'Zoom') {
    return `Please double-check that your name on Zoom appears as: **${language.toUpperCase()} — First and Last Name**`;
  }

  if (modality === 'In-Person') {
    return `Please arrive 10-15 minutes early to check in with the courtroom clerk or receptionist.`;
  }

  if (modality === 'Phone') {
    return `Please ensure you are available at the scheduled time. You may receive multiple calls from different parties (attorney, court, client).`;
  }

  return '';
}

/**
 * THREE-LAYER TEMPLATE RESOLUTION
 *
 * Get instructions with smart fallback:
 * 1. Try organization-specific instructions (Layer 3)
 * 2. If not found, use standard modality instructions (Layer 2)
 *
 * Uses Grade A formatting (placeholder substitution + markdown cleaning)
 *
 * @param orgInstructions - Organization-specific instructions from database
 * @param modality - Job modality ('Zoom', 'In-Person', 'Phone')
 * @param language - Language being interpreted (e.g., "Spanish")
 * @param interpreterName - Full interpreter name (optional, for placeholder substitution)
 * @returns Formatted instruction text ready for email
 */
export function getInstructionsWithFallback(
  orgInstructions: OrgInstructions | undefined,
  modality: string,
  language: string,
  interpreterName?: string
): string {
  console.log('🔧 getInstructionsWithFallback called:', { orgInstructions, modality, language });

  // Layer 3: Try organization-specific instructions first (with Grade A formatting)
  if (modality === 'Zoom' && orgInstructions?.zoom_instructions) {
    console.log('✅ Using Layer 3 (org-specific) Zoom instructions with Grade A formatting');
    const formatted = formatInstructionsGradeA(
      orgInstructions.zoom_instructions,
      language,
      interpreterName
    );
    console.log('📝 Formatted instructions:', formatted);
    return formatted;
  }

  if (modality === 'In-Person' && orgInstructions?.in_person_instructions) {
    console.log('✅ Using Layer 3 (org-specific) In-Person instructions with Grade A formatting');
    return formatInstructionsGradeA(
      orgInstructions.in_person_instructions,
      language,
      interpreterName
    );
  }

  if (modality === 'Phone' && orgInstructions?.phone_instructions) {
    console.log('✅ Using Layer 3 (org-specific) Phone instructions with Grade A formatting');
    return formatInstructionsGradeA(
      orgInstructions.phone_instructions,
      language,
      interpreterName
    );
  }

  // Layer 2: Fall back to standard modality instructions
  console.log('⚠️ Using Layer 2 (standard modality) fallback');
  return getStandardModalityInstructions(modality, language);
}

/**
 * @deprecated Use formatInstructionsGradeA from instructionFormatter.ts instead
 *
 * Legacy format function kept for reference.
 * New code should import and use formatInstructionsGradeA which provides:
 * - Better placeholder substitution ([Language Name], [Interpreter Full Name])
 * - Markdown cleaning (removes wikilinks, bold, italic)
 * - Backwards compatible with {{LANGUAGE}} placeholders
 */
function formatInstructions(instructions: string, language: string): string {
  console.log('⚠️ DEPRECATED: formatInstructions called - use formatInstructionsGradeA instead');
  console.log('🔄 formatInstructions input:', { instructions, language });
  const result = instructions.replace(/{{LANGUAGE}}/g, language.toUpperCase());
  console.log('🔄 formatInstructions output:', result);
  return result;
}

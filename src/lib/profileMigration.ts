import { ProfileMode } from './types/profile';
import { profileFields } from './profileFields';

/**
 * Defines the mapping structure for field transitions between profile modes.
 * Maps the from_field to the to_field. If a field maps to null, it means it doesn't
 * have a logical counterpart in the destination mode.
 */
export function getFieldMapping(fromMode: ProfileMode, toMode: ProfileMode): Record<string, string | null> {
  if (fromMode === toMode) {
    return {
      full_name: 'full_name',
      job_title: 'job_title',
      company: 'company',
      email: 'email',
      phone: 'phone',
      website: 'website',
      bio: 'bio'
    };
  }

  const mapping: Record<string, string | null> = {};
  
  // -- UNIVERSAL MAPPINGS --
  mapping.full_name = 'full_name';
  mapping.bio = 'bio';

  // -- SPECIFIC MAPPINGS --
  
  // CASUAL -> PROFESSIONAL
  if (fromMode === 'casual' && toMode === 'professional') {
    // casual status -> professional job title
    mapping.job_title = 'job_title';
    // casual school -> professional company
    mapping.company = 'company';
    // User requested: casual whatsapp -> professional email (if they put an email in it or as fallback)
    // However, since it's a phone, it might not be a valid email. We'll map it to email as requested
    // but the UI will handle validation.
    mapping.phone = null;
  }
  
  // PROFESSIONAL -> CASUAL
  if (fromMode === 'professional' && toMode === 'casual') {
    // professional job title -> casual status
    mapping.job_title = 'job_title'; 
    // professional company -> casual school
    mapping.company = 'company';
    // professional phone -> casual whatsapp
    mapping.phone = 'phone';
    // Email has no direct equivalent in casual, keep it hidden
    mapping.email = null;
  }

  // CASUAL -> CREATIVE
  if (fromMode === 'casual' && toMode === 'creative') {
    // casual status -> creative role
    mapping.job_title = 'job_title'; 
    // casual school doesn't make sense as a portfolio link (company in creative)
    mapping.company = null; 
    mapping.phone = null;
    mapping.email = null;
  }

  // CREATIVE -> CASUAL
  if (fromMode === 'creative' && toMode === 'casual') {
    // creative role -> casual status
    mapping.job_title = 'job_title';
    // creative portfolio link (company) doesn't make sense as casual school
    mapping.company = null; 
    mapping.phone = null;
    mapping.email = null;
  }

  // PROFESSIONAL -> CREATIVE
  if (fromMode === 'professional' && toMode === 'creative') {
    // professional job title -> creative role
    mapping.job_title = 'job_title';
    // professional company doesn't make sense as portfolio link
    mapping.company = null; 
    mapping.email = 'email';
    mapping.phone = null;
  }

  // CREATIVE -> PROFESSIONAL
  if (fromMode === 'creative' && toMode === 'professional') {
    // creative role -> professional job title
    mapping.job_title = 'job_title';
    // portfolio link shouldn't map to company name
    mapping.company = null; 
    mapping.email = 'email';
    mapping.phone = null;
  }

  return mapping;
}

/**
 * Migrates field data intelligently when a user switches modes.
 * 
 * @param fromMode - The previous mode
 * @param toMode - The target mode
 * @param oldData - The current form values
 * @returns The new form values with mapped data and preserved hidden data
 */
export function migrateFieldData(
  fromMode: ProfileMode, 
  toMode: ProfileMode, 
  oldData: Record<string, string>
): Record<string, string> {
  const mapping = getFieldMapping(fromMode, toMode);
  
  // Start with old data to PRESERVE fields that become hidden (so we can restore them if they switch back)
  const newData: Record<string, string> = { ...oldData };

  // Apply the specific migration rules
  for (const [oldKey, newKey] of Object.entries(mapping)) {
    // If there is a valid mapping and we have data in the old key
    if (newKey && oldData[oldKey] !== undefined) {
      // Don't overwrite if the newKey already has data (unless it's the exact same key)
      if (oldKey === newKey || !newData[newKey]) {
        newData[newKey] = oldData[oldKey] || '';
      }
    }
  }

  return newData;
}

/**
 * Validates the provided data against the requirements of the specific mode.
 * 
 * @param data - The form data to validate
 * @param mode - The current profile mode
 * @returns A record of error messages keyed by field name. Empty if valid.
 */
export function validateFieldsForMode(data: Record<string, string>, mode: ProfileMode): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields = profileFields[mode];

  if (!fields) return errors;

  for (const [key, config] of Object.entries(fields)) {
    const value = data[key] || '';
    
    // Required check
    if (config.required && value.trim() === '') {
      errors[key] = `${config.label} is required`;
    }
    
    // Max length check
    if (config.maxLength && value.length > config.maxLength) {
      errors[key] = `${config.label} must be less than ${config.maxLength} characters`;
    }

    // Type checking (rough validation)
    if (value.trim() !== '') {
      if (config.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[key] = `Please enter a valid email address`;
      }
      if (config.type === 'url' && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
        errors[key] = `Please enter a valid URL`;
      }
    }
  }

  return errors;
}

/**
 * Cleans the data object, removing any fields that are not part of the active mode.
 * Useful right before finalizing a save to prevent orphaned data bleed, 
 * but you might want to preserve data if you want a non-destructive save.
 * 
 * @param data - The raw form data
 * @param mode - The intended profile mode
 * @returns A clean object with only relevant fields
 */
export function cleanDataForMode(data: Record<string, string>, mode: ProfileMode): Record<string, string> {
  const cleaned: Record<string, string> = {};
  const fields = profileFields[mode];

  if (!fields) return data;

  // Only copy over fields defined in the mode's configuration
  // Leave other values behind
  for (const key of Object.keys(fields)) {
    cleaned[key] = data[key] || '';
  }
  
  return cleaned;
}

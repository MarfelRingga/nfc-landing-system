import { ProfileMode } from '../types/profile';

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidUrl = (url: string) => {
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlPattern.test(url);
};

const isValidPhone = (phone: string) => {
  // Allow numbers, spaces, plus signs, and dashes, at least 8 digits/characters long
  return /^\+?[\d\s-]{8,}$/.test(phone);
};

/**
 * Validates profile data against specific rules based on the profile mode.
 * 
 * @param data - The form data to check
 * @param mode - The current profile mode (casual, professional, creative)
 * @returns Array of ValidationError objects with field, message, and type.
 */
export const getValidationErrors = (
  data: Record<string, string>, 
  mode: ProfileMode
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Extract common fields for easier validation. Key names align with database schema.
  const fullName = (data.full_name || '').trim();
  const jobTitle = (data.job_title || '').trim();
  const company = (data.company || '').trim();
  const email = (data.email || '').trim();
  const phone = (data.phone || '').trim();
  const website = (data.website || '').trim();
  const bio = (data.bio || '').trim();

  // Mode: CASUAL
  if (mode === 'casual') {
    if (!fullName) {
      errors.push({ field: 'full_name', message: 'Name is required to let people know who you are.', type: 'error' });
    } else if (fullName.length < 2) {
      errors.push({ field: 'full_name', message: 'Name should be at least 2 characters long.', type: 'error' });
    } else if (fullName.length > 30) {
      errors.push({ field: 'full_name', message: 'Name is a bit too long, let\'s keep it under 30 characters.', type: 'error' });
    }

    if (jobTitle && jobTitle.length > 60) {
      errors.push({ field: 'job_title', message: 'Status should be under 60 characters.', type: 'error' });
    }

    if (company && company.length > 100) {
      errors.push({ field: 'company', message: 'School name is quite long, please keep it under 100 characters.', type: 'error' });
    }

    if (phone && !isValidPhone(phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number (e.g. with numbers, +, and spaces).', type: 'error' });
    }

    if (bio && bio.length > 300) {
      errors.push({ field: 'bio', message: 'Bio should be 300 characters or less for casual mode.', type: 'error' });
    }
  }

  // Mode: PROFESSIONAL
  if (mode === 'professional') {
    if (!fullName) {
      errors.push({ field: 'full_name', message: 'Full name is required for a professional profile.', type: 'error' });
    } else if (fullName.length < 3) {
      errors.push({ field: 'full_name', message: 'Full name should be at least 3 characters long.', type: 'error' });
    } else if (fullName.length > 60) {
      errors.push({ field: 'full_name', message: 'Full name should be 60 characters or less.', type: 'error' });
    }

    if (jobTitle && jobTitle.length > 50) {
      errors.push({ field: 'job_title', message: 'Job title should be 50 characters or less.', type: 'error' });
    }

    if (company && company.length > 50) {
      errors.push({ field: 'company', message: 'Company name should be 50 characters or less.', type: 'error' });
    }

    if (!email) {
      errors.push({ field: 'email', message: 'Email address is required for professional mode.', type: 'error' });
    } else if (!isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address so recruiters can reach you.', type: 'error' });
    }

    if (phone && !isValidPhone(phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number.', type: 'error' });
    }

    if (bio && bio.length > 500) {
      errors.push({ field: 'bio', message: 'Professional summary should be 500 characters or less.', type: 'error' });
    }
  }

  // Mode: CREATIVE
  if (mode === 'creative') {
    if (!fullName) {
      errors.push({ field: 'full_name', message: 'Artist or Pen Name is required.', type: 'error' });
    } else if (fullName.length < 2) {
      errors.push({ field: 'full_name', message: 'Name should be at least 2 characters long.', type: 'error' });
    } else if (fullName.length > 30) {
      errors.push({ field: 'full_name', message: 'Name should be 30 characters or less.', type: 'error' });
    }

    if (jobTitle && jobTitle.length > 50) {
      errors.push({ field: 'job_title', message: 'Creative role should be 50 characters or less.', type: 'error' });
    }

    if (website && !isValidUrl(website)) {
      errors.push({ field: 'website', message: 'Please enter a valid URL for your portfolio website.', type: 'error' });
    }

    if (email && !isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address.', type: 'error' });
    }

    if (bio && bio.length > 400) {
      errors.push({ field: 'bio', message: 'Bio should be 400 characters or less.', type: 'error' });
    }
  }

  return errors;
};

/**
 * Validates the profile against the selected mode and returns a boolean indicating
 * if the data is valid (i.e. has no critical errors).
 * 
 * @param data - The form data to check
 * @param mode - The current profile mode
 * @returns true if valid (no errors of type 'error'), false otherwise.
 */
export const validateProfileForMode = (data: Record<string, string>, mode: ProfileMode): boolean => {
  const errors = getValidationErrors(data, mode);
  // We consider it invalid if there are any 'error' level validation issues.
  const hasCriticalErrors = errors.some(err => err.type === 'error');
  return !hasCriticalErrors;
};

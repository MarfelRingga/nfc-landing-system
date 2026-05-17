import { ProfileMode, ProfileField } from './types/profile';

/**
 * Configuration for form fields across different profile modes.
 * Each mode defines the specific fields required or optional for that archetype.
 */
export const profileFields: Record<ProfileMode, Record<string, ProfileField>> = {
  casual: {
    full_name: {
      label: 'Display Name',
      placeholder: 'Nama panggilan kamu',
      type: 'text',
      required: true,
      icon: 'User',
      maxLength: 30
    },
    job_title: {
      label: 'Status/Headline',
      placeholder: 'e.g., Siswa SMA, Lagi sibuk ujian...',
      type: 'text',
      required: false,
      icon: 'Smile',
      maxLength: 60
    },
    company: {
      label: 'School / University',
      placeholder: 'Asal sekolah atau kampus',
      type: 'text',
      required: false,
      icon: 'GraduationCap',
      maxLength: 50
    },
    phone: {
      label: 'WhatsApp Number',
      placeholder: '+62 8xx xxxx xxxx',
      type: 'tel',
      required: false,
      icon: 'MessageCircle',
      autoFormat: 'phone'
    },
    bio: {
      label: 'About Me',
      placeholder: 'Ceritakan sedikit tentang dirimu...',
      type: 'textarea',
      required: false,
      icon: 'Info',
      maxLength: 160
    }
  },
  professional: {
    full_name: {
      label: 'Full Name',
      placeholder: 'Your formal full name',
      type: 'text',
      required: true,
      icon: 'User',
      maxLength: 50
    },
    job_title: {
      label: 'Job Title',
      placeholder: 'e.g., Founder, Software Engineer',
      type: 'text',
      required: true,
      icon: 'Briefcase',
      maxLength: 60
    },
    company: {
      label: 'Company / Organization',
      placeholder: 'Where do you work?',
      type: 'text',
      required: false,
      icon: 'Building',
      maxLength: 60
    },
    email: {
      label: 'Work Email',
      placeholder: 'you@company.com',
      type: 'email',
      required: true,
      icon: 'Mail',
      autoFormat: 'email'
    },
    phone: {
      label: 'Business Phone',
      placeholder: '+62 8xx xxxx xxxx',
      type: 'tel',
      required: false,
      icon: 'Phone',
      autoFormat: 'phone'
    },
    bio: {
      label: 'Professional Summary',
      placeholder: 'Brief overview of your experience and goals...',
      type: 'textarea',
      required: false,
      icon: 'FileText',
      maxLength: 300
    }
  },
  creative: {
    full_name: {
      label: 'Artist / Pen Name',
      placeholder: 'How you want to be known',
      type: 'text',
      required: true,
      icon: 'User',
      maxLength: 40
    },
    job_title: {
      label: 'Creative Role',
      placeholder: 'e.g., UI/UX Designer, Illustrator',
      type: 'text',
      required: true,
      icon: 'Palette',
      maxLength: 60
    },
    company: {
      label: 'Portfolio Link',
      placeholder: 'https://behance.net/yourname',
      type: 'url',
      required: false,
      icon: 'Link',
      autoFormat: 'url'
    },
    email: {
      label: 'Contact Email',
      placeholder: 'hello@yourdomain.com',
      type: 'email',
      required: true,
      icon: 'Mail',
      autoFormat: 'email'
    },
    bio: {
      label: 'Creative Vision',
      placeholder: 'Share your artistic philosophy or current focus...',
      type: 'textarea',
      required: false,
      icon: 'Feather',
      maxLength: 300
    }
  }
};

/**
 * Retrieves the field configuration for a specific profile mode.
 * 
 * @param mode - The current profile mode (casual, professional, creative)
 * @returns A record of field definitions for the specified mode
 */
export function getFieldsByMode(mode: ProfileMode): Record<string, ProfileField> {
  return profileFields[mode];
}

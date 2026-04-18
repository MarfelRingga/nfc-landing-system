export function formatIndonesianPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 0) return '';

  // Handle different starting patterns
  if (cleaned.startsWith('0')) {
    // Replace leading 0 with 62
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    // Prepend 62 to numbers starting with 8
    cleaned = '62' + cleaned;
  } else if (!cleaned.startsWith('62')) {
    // If it doesn't start with 62, 0, or 8, we assume it's missing the country code
    cleaned = '62' + cleaned;
  }

  // Prepend the '+' sign required by E.164 format
  return `+${cleaned}`;
}

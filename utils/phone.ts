import { parse, format, AsYouType, CountryCode } from 'libphonenumber-js';

/**
 * Formats a phone number in a human-readable format.
 * Uses libphonenumber-js for proper international phone number formatting.
 *
 * Attempts to parse and format phone numbers in a locale-aware way.
 * If the number can't be parsed, it returns the original number.
 *
 * Examples:
 * - "1234567890" -> "(123) 456-7890" (assuming US)
 * - "+11234567890" -> "+1 (123) 456-7890"
 * - "+442071234567" -> "+44 20 7123 4567" (UK format)
 * - "+33123456789" -> "+33 1 23 45 67 89" (France format)
 */
export function formatPhoneNumber(
  phone: string | undefined | null,
  defaultCountry: CountryCode = 'US'
): string {
  if (!phone) {
    return '';
  }

  // Try to parse the phone number
  const phoneNumber = parse(phone, defaultCountry);

  // If valid, format in international format
  if (phoneNumber) {
    return format(phoneNumber, 'NATIONAL');
  }

  // Fallback: try parsing with international format (no default country)
  const internationalNumber = parse(phone);
  if (internationalNumber) {
    // For international numbers, show with country code
    return format(internationalNumber, 'INTERNATIONAL');
  }

  // If parsing fails entirely, return number with basic formatting for readability
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Add spaces for readability if it's a long number
  if (cleaned.length > 6) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }

  if (cleaned.length > 3) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
  }

  return phone;
}

/**
 * Formats a phone number progressively as the user types.
 * Useful for input fields where you want real-time formatting.
 */
export function formatPhoneNumberAsYouType(
  phone: string,
  defaultCountry: CountryCode = 'US'
): string {
  if (!phone) {
    return '';
  }

  const asYouType = new AsYouType(defaultCountry);
  return asYouType.input(phone);
}

/**
 * Formats a phone number for use in tel: or sms: URLs.
 * Returns the E.164 format (standard international format).
 */
export function formatPhoneUrl(
  phone: string | undefined | null,
  defaultCountry: CountryCode = 'US'
): string {
  if (!phone) {
    return '';
  }

  // Try to parse and format as E.164
  const phoneNumber = parse(phone, defaultCountry);

  if (phoneNumber) {
    return format(phoneNumber, 'E.164');
  }

  // Fallback: try parsing with international format (no default country)
  const internationalNumber = parse(phone);
  if (internationalNumber) {
    return format(internationalNumber, 'E.164');
  }

  // If parsing fails, strip all non-digit characters
  return phone.replace(/[^\d]/g, '');
}

/**
 * Validates if a phone number is valid for the given country.
 */
export function isValidPhoneNumber(
  phone: string | undefined | null,
  defaultCountry: CountryCode = 'US'
): boolean {
  if (!phone) {
    return false;
  }

  const phoneNumber = parse(phone, defaultCountry);
  if (phoneNumber) {
    return true;
  }

  // Try parsing without default country
  const internationalNumber = parse(phone);
  return !!internationalNumber;
}

/**
 * Gets the country code from a phone number if possible.
 */
export function getPhoneNumberCountry(
  phone: string | undefined | null,
  defaultCountry: CountryCode = 'US'
): CountryCode | undefined {
  if (!phone) {
    return undefined;
  }

  const phoneNumber = parse(phone, defaultCountry);
  if (phoneNumber) {
    return phoneNumber.country;
  }

  const internationalNumber = parse(phone);
  if (internationalNumber) {
    return internationalNumber.country;
  }

  return undefined;
}

/**
 * =====================================
 * TURKEY INPUTS - INDEX
 * =====================================
 *
 * Turkey-specific input components.
 */

// Phone
export { PhoneInput, isValidTurkishPhone, type PhoneInputProps } from './PhoneInput';

// Identity & Tax
export { TCKimlikInput, validateTCKimlik, isValidTCKimlikFormat, type TCKimlikInputProps } from './TCKimlikInput';
export { TaxNumberInput, validateCompanyTaxNumber, isValidTaxNumberFormat, type TaxNumberInputProps } from './TaxNumberInput';

// Location
export { CitySelect, type CitySelectProps } from './CitySelect';
export { DistrictSelect, type DistrictSelectProps } from './DistrictSelect';

// Banking
export { IBANInput, isValidTurkishIBAN, type IBANInputProps } from './IBANInput';

// Data exports
export * from './data';

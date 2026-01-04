/**
 * Advanced Form Validation Library
 * Real-time validation with debounce and visual feedback
 */

// Email validation with detailed feedback
export interface EmailValidationResult {
    isValid: boolean;
    error?: string;
    suggestion?: string;
}

const commonEmailDomains = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
    'icloud.com', 'protonmail.com', 'mail.com',
];

const commonMisspellings: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'outloo.com': 'outlook.com',
    'outlok.com': 'outlook.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
};

export function validateEmail(email: string): EmailValidationResult {
    if (!email || email.trim() === '') {
        return { isValid: false };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        if (!trimmedEmail.includes('@')) {
            return { isValid: false, error: '@ işareti eksik' };
        }
        const parts = trimmedEmail.split('@');
        if (parts.length > 2) {
            return { isValid: false, error: 'Birden fazla @ işareti var' };
        }
        if (!parts[1] || !parts[1].includes('.')) {
            return { isValid: false, error: 'Geçerli bir domain girin (örn: gmail.com)' };
        }
        return { isValid: false, error: 'Geçerli bir e-posta adresi girin' };
    }

    // Check for common misspellings
    const domain = trimmedEmail.split('@')[1];
    const correction = commonMisspellings[domain];
    if (correction) {
        const correctedEmail = trimmedEmail.replace(domain, correction);
        return {
            isValid: true,
            suggestion: `Bunu mu demek istediniz: ${correctedEmail}?`,
        };
    }

    // Additional checks
    const localPart = trimmedEmail.split('@')[0];
    if (localPart.length < 1) {
        return { isValid: false, error: 'E-posta adresi çok kısa' };
    }
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return { isValid: false, error: 'E-posta adresi nokta ile başlayamaz veya bitemez' };
    }

    return { isValid: true };
}

// Password validation with strength scoring
export interface PasswordValidationResult {
    isValid: boolean;
    strength: 0 | 1 | 2 | 3 | 4 | 5;
    strengthText: string;
    requirements: PasswordRequirement[];
    suggestions: string[];
}

export interface PasswordRequirement {
    id: string;
    label: string;
    met: boolean;
}

export function validatePassword(password: string): PasswordValidationResult {
    const requirements: PasswordRequirement[] = [
        { id: 'length', label: 'En az 8 karakter', met: password.length >= 8 },
        { id: 'uppercase', label: 'En az 1 büyük harf', met: /[A-Z]/.test(password) },
        { id: 'lowercase', label: 'En az 1 küçük harf', met: /[a-z]/.test(password) },
        { id: 'number', label: 'En az 1 rakam', met: /[0-9]/.test(password) },
        { id: 'special', label: 'Özel karakter (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    ];

    const metCount = requirements.filter(r => r.met).length;
    const strength = Math.min(5, metCount) as 0 | 1 | 2 | 3 | 4 | 5;

    const strengthTexts: Record<number, string> = {
        0: 'Çok zayıf',
        1: 'Zayıf',
        2: 'Orta',
        3: 'İyi',
        4: 'Güçlü',
        5: 'Çok güçlü',
    };

    const suggestions: string[] = [];
    if (!requirements[0].met) {
        suggestions.push(`${8 - password.length} karakter daha ekleyin`);
    }
    if (password.length >= 8 && !requirements[4].met && metCount < 4) {
        suggestions.push('Özel karakter ekleyerek şifrenizi güçlendirin');
    }
    if (password.length >= 12 && metCount >= 4) {
        suggestions.push('Harika bir şifre!');
    }

    // Common password patterns to avoid
    const commonPatterns = ['123456', 'password', 'qwerty', '111111', 'abc123'];
    if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
        suggestions.unshift('Yaygın şifre kalıplarından kaçının');
    }

    return {
        isValid: metCount >= 3 && requirements[0].met,
        strength,
        strengthText: strengthTexts[strength],
        requirements,
        suggestions,
    };
}

// Team/Company name validation
export interface TeamNameValidationResult {
    isValid: boolean;
    error?: string;
    formatted: string;
}

export function validateTeamName(name: string): TeamNameValidationResult {
    const formatted = name.toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (!formatted) {
        return { isValid: false, formatted: '' };
    }

    if (formatted.length < 3) {
        return { isValid: false, error: 'En az 3 karakter olmalı', formatted };
    }

    if (formatted.length > 30) {
        return { isValid: false, error: 'En fazla 30 karakter olabilir', formatted };
    }

    if (formatted.startsWith('-') || formatted.endsWith('-')) {
        return { isValid: false, error: 'Tire ile başlayamaz veya bitemez', formatted };
    }

    if (formatted.includes('--')) {
        return { isValid: false, error: 'Ardışık tire kullanılamaz', formatted };
    }

    // Reserved words
    const reserved = ['admin', 'api', 'www', 'mail', 'ftp', 'support', 'help', 'app', 'mobile'];
    if (reserved.includes(formatted)) {
        return { isValid: false, error: 'Bu isim kullanılamaz', formatted };
    }

    return { isValid: true, formatted };
}

// Phone number validation (Turkish format)
export interface PhoneValidationResult {
    isValid: boolean;
    error?: string;
    formatted: string;
}

export function validatePhone(phone: string): PhoneValidationResult {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    if (!digits) {
        return { isValid: false, formatted: '' };
    }

    // Turkish phone number validation
    let normalized = digits;

    // Handle country code
    if (normalized.startsWith('90')) {
        normalized = normalized.substring(2);
    } else if (normalized.startsWith('0')) {
        normalized = normalized.substring(1);
    }

    if (normalized.length !== 10) {
        return {
            isValid: false,
            error: 'Telefon numarası 10 haneli olmalı',
            formatted: digits,
        };
    }

    // Turkish mobile prefixes
    const mobilePrefix = normalized.substring(0, 3);
    const validPrefixes = ['530', '531', '532', '533', '534', '535', '536', '537', '538', '539',
                          '540', '541', '542', '543', '544', '545', '546', '547', '548', '549',
                          '550', '551', '552', '553', '554', '555', '556', '557', '558', '559'];

    if (!validPrefixes.includes(mobilePrefix)) {
        return {
            isValid: false,
            error: 'Geçerli bir GSM numarası girin',
            formatted: digits,
        };
    }

    // Format: 5XX XXX XX XX
    const formatted = `${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6, 8)} ${normalized.substring(8, 10)}`;

    return { isValid: true, formatted };
}

// Debounce utility for real-time validation
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

// Credit card validation (basic Luhn algorithm)
export interface CardValidationResult {
    isValid: boolean;
    cardType?: 'visa' | 'mastercard' | 'amex' | 'unknown';
    formatted: string;
}

export function validateCard(cardNumber: string): CardValidationResult {
    const digits = cardNumber.replace(/\D/g, '');

    if (!digits || digits.length < 13 || digits.length > 19) {
        return { isValid: false, formatted: digits };
    }

    // Determine card type
    let cardType: 'visa' | 'mastercard' | 'amex' | 'unknown' = 'unknown';
    if (digits.startsWith('4')) {
        cardType = 'visa';
    } else if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
        cardType = 'mastercard';
    } else if (digits.startsWith('34') || digits.startsWith('37')) {
        cardType = 'amex';
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    // Format card number
    let formatted = '';
    if (cardType === 'amex') {
        formatted = `${digits.substring(0, 4)} ${digits.substring(4, 10)} ${digits.substring(10)}`;
    } else {
        formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    }

    return {
        isValid: sum % 10 === 0,
        cardType,
        formatted,
    };
}

/**
 * Form Validation Hook with Real-time Validation and Debounce
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    validateEmail,
    validatePassword,
    validateTeamName,
    validatePhone,
    EmailValidationResult,
    PasswordValidationResult,
    TeamNameValidationResult,
    PhoneValidationResult,
} from './index';

interface UseEmailValidationOptions {
    debounceMs?: number;
    validateOnChange?: boolean;
}

export function useEmailValidation(options: UseEmailValidationOptions = {}) {
    const { debounceMs = 300, validateOnChange = true } = options;

    const [email, setEmail] = useState('');
    const [result, setResult] = useState<EmailValidationResult>({ isValid: false });
    const [isValidating, setIsValidating] = useState(false);
    const [touched, setTouched] = useState(false);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const validate = useCallback((value: string) => {
        setIsValidating(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const validationResult = validateEmail(value);
            setResult(validationResult);
            setIsValidating(false);
        }, debounceMs);
    }, [debounceMs]);

    const handleChange = useCallback((value: string) => {
        const lowerValue = value.toLowerCase().trim();
        setEmail(lowerValue);

        if (validateOnChange && lowerValue.length > 0) {
            validate(lowerValue);
        } else if (lowerValue.length === 0) {
            setResult({ isValid: false });
        }
    }, [validate, validateOnChange]);

    const handleBlur = useCallback(() => {
        setTouched(true);
        if (email.length > 0) {
            validate(email);
        }
    }, [email, validate]);

    const reset = useCallback(() => {
        setEmail('');
        setResult({ isValid: false });
        setTouched(false);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        email,
        setEmail: handleChange,
        isValid: result.isValid,
        error: touched && !result.isValid && email.length > 0 ? result.error : undefined,
        suggestion: result.suggestion,
        isValidating,
        touched,
        onBlur: handleBlur,
        reset,
        applySuggestion: () => {
            if (result.suggestion) {
                const match = result.suggestion.match(/: (.+)\?$/);
                if (match) {
                    handleChange(match[1]);
                }
            }
        },
    };
}

interface UsePasswordValidationOptions {
    minStrength?: number; // Minimum required strength (0-5)
    validateOnChange?: boolean;
}

export function usePasswordValidation(options: UsePasswordValidationOptions = {}) {
    const { minStrength = 3, validateOnChange = true } = options;

    const [password, setPassword] = useState('');
    const [result, setResult] = useState<PasswordValidationResult>({
        isValid: false,
        strength: 0,
        strengthText: 'Çok zayıf',
        requirements: [],
        suggestions: [],
    });
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = useCallback((value: string) => {
        const validationResult = validatePassword(value);
        setResult({
            ...validationResult,
            isValid: validationResult.strength >= minStrength && validationResult.requirements[0].met,
        });
    }, [minStrength]);

    const handleChange = useCallback((value: string) => {
        setPassword(value);
        if (validateOnChange) {
            validate(value);
        }
    }, [validate, validateOnChange]);

    const handleBlur = useCallback(() => {
        setTouched(true);
        validate(password);
    }, [password, validate]);

    const toggleShowPassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const reset = useCallback(() => {
        setPassword('');
        setResult({
            isValid: false,
            strength: 0,
            strengthText: 'Çok zayıf',
            requirements: [],
            suggestions: [],
        });
        setTouched(false);
    }, []);

    return {
        password,
        setPassword: handleChange,
        isValid: result.isValid,
        strength: result.strength,
        strengthText: result.strengthText,
        requirements: result.requirements,
        suggestions: result.suggestions,
        touched,
        onBlur: handleBlur,
        showPassword,
        toggleShowPassword,
        reset,
    };
}

interface UseTeamNameValidationOptions {
    debounceMs?: number;
    checkAvailability?: (name: string) => Promise<boolean>;
}

export function useTeamNameValidation(options: UseTeamNameValidationOptions = {}) {
    const { debounceMs = 500, checkAvailability } = options;

    const [teamName, setTeamName] = useState('');
    const [result, setResult] = useState<TeamNameValidationResult>({
        isValid: false,
        formatted: '',
    });
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [touched, setTouched] = useState(false);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const validate = useCallback(async (value: string) => {
        const validationResult = validateTeamName(value);
        setResult(validationResult);

        if (validationResult.isValid && checkAvailability) {
            setIsChecking(true);
            try {
                const available = await checkAvailability(validationResult.formatted);
                setIsAvailable(available);
            } catch {
                setIsAvailable(null);
            } finally {
                setIsChecking(false);
            }
        } else {
            setIsAvailable(null);
        }
    }, [checkAvailability]);

    const handleChange = useCallback((value: string) => {
        const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setTeamName(formatted);
        setIsAvailable(null);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (formatted.length > 0) {
            timeoutRef.current = setTimeout(() => {
                validate(formatted);
            }, debounceMs);
        } else {
            setResult({ isValid: false, formatted: '' });
        }
    }, [validate, debounceMs]);

    const handleBlur = useCallback(() => {
        setTouched(true);
    }, []);

    const reset = useCallback(() => {
        setTeamName('');
        setResult({ isValid: false, formatted: '' });
        setIsAvailable(null);
        setTouched(false);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        teamName,
        setTeamName: handleChange,
        formatted: result.formatted,
        isValid: result.isValid && (isAvailable === null || isAvailable === true),
        error: touched && result.error,
        isChecking,
        isAvailable,
        touched,
        onBlur: handleBlur,
        reset,
    };
}

export function usePhoneValidation() {
    const [phone, setPhone] = useState('');
    const [result, setResult] = useState<PhoneValidationResult>({
        isValid: false,
        formatted: '',
    });
    const [touched, setTouched] = useState(false);

    const handleChange = useCallback((value: string) => {
        const digits = value.replace(/\D/g, '');
        setPhone(digits);

        if (digits.length > 0) {
            const validationResult = validatePhone(digits);
            setResult(validationResult);

            // If valid, use formatted version
            if (validationResult.isValid) {
                setPhone(validationResult.formatted);
            }
        } else {
            setResult({ isValid: false, formatted: '' });
        }
    }, []);

    const handleBlur = useCallback(() => {
        setTouched(true);
    }, []);

    const reset = useCallback(() => {
        setPhone('');
        setResult({ isValid: false, formatted: '' });
        setTouched(false);
    }, []);

    return {
        phone,
        setPhone: handleChange,
        formatted: result.formatted,
        isValid: result.isValid,
        error: touched && !result.isValid && phone.length > 0 ? result.error : undefined,
        touched,
        onBlur: handleBlur,
        reset,
    };
}

// Combined form validation for auth forms
interface UseAuthFormValidationOptions {
    requireEmail?: boolean;
    requirePassword?: boolean;
    requireTeamName?: boolean;
    minPasswordStrength?: number;
}

export function useAuthFormValidation(options: UseAuthFormValidationOptions = {}) {
    const {
        requireEmail = true,
        requirePassword = true,
        requireTeamName = false,
        minPasswordStrength = 3,
    } = options;

    const emailValidation = useEmailValidation();
    const passwordValidation = usePasswordValidation({ minStrength: minPasswordStrength });
    const teamNameValidation = useTeamNameValidation();

    const isFormValid = useCallback(() => {
        let valid = true;

        if (requireEmail && !emailValidation.isValid) valid = false;
        if (requirePassword && !passwordValidation.isValid) valid = false;
        if (requireTeamName && !teamNameValidation.isValid) valid = false;

        return valid;
    }, [
        requireEmail,
        requirePassword,
        requireTeamName,
        emailValidation.isValid,
        passwordValidation.isValid,
        teamNameValidation.isValid,
    ]);

    const resetAll = useCallback(() => {
        emailValidation.reset();
        passwordValidation.reset();
        teamNameValidation.reset();
    }, []);

    return {
        email: emailValidation,
        password: passwordValidation,
        teamName: teamNameValidation,
        isFormValid: isFormValid(),
        resetAll,
    };
}

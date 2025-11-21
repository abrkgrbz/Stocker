'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';

interface VerificationCodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function VerificationCodeInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  error = false,
}: VerificationCodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length > 1) {
      // Handle paste
      handlePaste(numericValue, index);
      return;
    }

    const newCode = [...code];
    newCode[index] = numericValue;
    setCode(newCode);

    // Call onChange callback
    const codeString = newCode.join('');
    onChange?.(codeString);

    // Auto-focus next input
    if (numericValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Call onComplete if all filled
    if (newCode.every((digit) => digit !== '') && newCode.length === length) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input if current is empty
        inputsRef.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
        onChange?.(newCode.join(''));
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (pastedData: string, startIndex: number = 0) => {
    if (disabled) return;

    const numericData = pastedData.replace(/[^0-9]/g, '');
    const newCode = [...code];

    for (let i = 0; i < numericData.length && startIndex + i < length; i++) {
      newCode[startIndex + i] = numericData[i];
    }

    setCode(newCode);
    onChange?.(newCode.join(''));

    // Focus next empty input or last input
    const nextEmptyIndex = newCode.findIndex((digit) => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputsRef.current[focusIndex]?.focus();

    // Call onComplete if all filled
    if (newCode.every((digit) => digit !== '') && newCode.length === length) {
      onComplete(newCode.join(''));
    }
  };

  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePaste(pastedData, index);
  };

  return (
    <div className="flex gap-2 justify-center">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePasteEvent(e, index)}
          disabled={disabled}
          className={`
            w-12 h-14 sm:w-14 sm:h-16
            text-center text-2xl font-bold
            border-2 rounded-xl
            transition-all duration-200
            focus:outline-none focus:ring-4
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20'
                : digit
                ? 'border-violet-500 bg-violet-50 text-violet-900 focus:border-violet-600 focus:ring-violet-500/20'
                : 'border-gray-300 bg-white text-gray-900 focus:border-violet-500 focus:ring-violet-500/20'
            }
          `}
          autoComplete="off"
        />
      ))}
    </div>
  );
}

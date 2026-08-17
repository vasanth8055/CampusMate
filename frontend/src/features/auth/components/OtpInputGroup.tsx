import { useRef, type ChangeEvent, type KeyboardEvent, type ClipboardEvent } from "react";

type OtpInputGroupProps = {
  value: string[];
  onChange: (nextValue: string[]) => void;
};

const OTP_LENGTH = 6;

export default function OtpInputGroup({ value, onChange }: OtpInputGroupProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, OTP_LENGTH - 1));
    inputRefs.current[nextIndex]?.focus();
    inputRefs.current[nextIndex]?.select();
  };

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextDigit = event.target.value.replace(/\D/g, "").slice(0, 1);
    const updatedValue = [...value];
    updatedValue[index] = nextDigit;
    onChange(updatedValue);

    if (nextDigit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text").replace(/\D/g, "");

    if (!pastedText) {
      return;
    }

    const updatedValue = [...value];
    const startIndex = index;

    for (let i = 0; i < pastedText.length && startIndex + i < OTP_LENGTH; i += 1) {
      updatedValue[startIndex + i] = pastedText[i];
    }

    onChange(updatedValue);

    const nextIndex = Math.min(startIndex + pastedText.length, OTP_LENGTH - 1);
    focusInput(nextIndex);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length: OTP_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus={index === 0}
          maxLength={1}
          value={value[index]}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          aria-label={`OTP digit ${index + 1}`}
          className="h-12 w-11 sm:h-14 sm:w-13 rounded-xl border border-slate-300 dark:border-border bg-surface text-center text-xl font-bold text-foreground shadow-xs outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      ))}
    </div>
  );
}

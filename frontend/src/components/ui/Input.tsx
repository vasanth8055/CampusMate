import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/cn";

import { Spinner } from "./Spinner";

const inputWrapperVariants = tv({
  base: [
    "flex w-full items-center gap-2",
    "rounded-input border bg-surface px-3",
    "text-body text-foreground",
    "transition-colors duration-150",
    "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
  ],
  variants: {
    state: {
      default: "border-border hover:border-foreground-muted",
      error: "border-danger focus-within:outline-danger",
      success: "border-success focus-within:outline-success",
    },
    size: {
      sm: "h-9 text-small",
      md: "h-10",
      lg: "h-12 text-body-lg",
    },
  },
  defaultVariants: {
    state: "default",
    size: "md",
  },
});

const fieldVariants = tv({
  base: [
    "min-w-0 flex-1 border-0 bg-transparent p-0",
    "text-foreground placeholder:text-foreground-muted",
    "outline-none disabled:cursor-not-allowed disabled:opacity-50",
  ],
});

type InputWrapperProps = VariantProps<typeof inputWrapperVariants>;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> &
  InputWrapperProps & {
    label?: string;
    helperText?: string;
    error?: string;
    success?: string;
    prefixIcon?: ReactNode;
    suffixIcon?: ReactNode;
    loading?: boolean;
    clearable?: boolean;
    onClear?: () => void;
    containerClassName?: string;
    wrapperClassName?: string;
  };

function resolveState(error?: string, success?: string): InputWrapperProps["state"] {
  if (error) return "error";
  if (success) return "success";
  return "default";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      wrapperClassName,
      label,
      helperText,
      error,
      success,
      prefixIcon,
      suffixIcon,
      loading = false,
      clearable = false,
      onClear,
      disabled,
      id,
      size,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const fieldId = id ?? props.name;
    const state = resolveState(error, success);
    const message = error ?? success ?? helperText;
    const messageId = message && fieldId ? `${fieldId}-message` : undefined;
    const showClear =
      clearable &&
      !loading &&
      !disabled &&
      value !== undefined &&
      value !== null &&
      String(value).length > 0;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label htmlFor={fieldId} className="text-label text-foreground">
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            inputWrapperVariants({ state, size }),
            disabled && "cursor-not-allowed opacity-50",
            wrapperClassName,
          )}
        >
          {prefixIcon ? (
            <span className="shrink-0 text-foreground-muted" aria-hidden="true">
              {prefixIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={fieldId}
            disabled={disabled || loading}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={messageId}
            value={value}
            onChange={onChange}
            className={cn(fieldVariants(), className)}
            {...props}
          />

          {loading ? (
            <Spinner size="sm" className="shrink-0 text-foreground-muted" />
          ) : null}

          {showClear ? (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 rounded-full p-0.5 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {!loading && suffixIcon ? (
            <span className="shrink-0 text-foreground-muted">{suffixIcon}</span>
          ) : null}
        </div>

        {message ? (
          <p
            id={messageId}
            className={cn(
              "text-small",
              error && "text-danger",
              !error && success && "text-success",
              !error && !success && "text-foreground-secondary",
            )}
          >
            {message}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export type PasswordInputProps = Omit<InputProps, "type" | "suffixIcon">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        suffixIcon={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="rounded-full p-0.5 transition-colors hover:text-foreground"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export type SearchInputProps = Omit<InputProps, "type"> & {
  onSearch?: (value: string) => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ prefixIcon, onSearch, onKeyDown, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        prefixIcon={prefixIcon ?? <Search className="h-4 w-4" aria-hidden="true" />}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onSearch) {
            onSearch((event.target as HTMLInputElement).value);
          }
          onKeyDown?.(event);
        }}
        {...props}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> &
  Omit<InputWrapperProps, "size"> & {
    label?: string;
    helperText?: string;
    error?: string;
    success?: string;
    containerClassName?: string;
    textareaClassName?: string;
  };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      textareaClassName,
      containerClassName,
      label,
      helperText,
      error,
      success,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const fieldId = id ?? props.name;
    const state = resolveState(error, success);
    const message = error ?? success ?? helperText;
    const messageId = message && fieldId ? `${fieldId}-message` : undefined;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label htmlFor={fieldId} className="text-label text-foreground">
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={fieldId}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={messageId}
          className={cn(
            "min-h-24 w-full resize-y rounded-input border bg-surface px-3 py-2.5",
            "text-foreground placeholder:text-foreground-muted",
            "transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            state === "error" && "border-danger focus-visible:outline-danger",
            state === "success" && "border-success focus-visible:outline-success",
            state === "default" &&
              "border-border hover:border-foreground-muted focus-visible:outline-ring",
            textareaClassName,
            className,
          )}
          {...props}
        />

        {message ? (
          <p
            id={messageId}
            className={cn(
              "text-small",
              error && "text-danger",
              !error && success && "text-success",
              !error && !success && "text-foreground-secondary",
            )}
          >
            {message}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export type OtpInputProps = {
  length?: number;
  value: string[];
  onChange: (nextValue: string[]) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  containerClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function OtpInput({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
  containerClassName,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, length - 1));
    inputRefs.current[nextIndex]?.focus();
    inputRefs.current[nextIndex]?.select();
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const nextDigit = event.target.value.replace(/\D/g, "").slice(0, 1);
    const updatedValue = [...value];
    updatedValue[index] = nextDigit;
    onChange(updatedValue);

    if (nextDigit && index < length - 1) {
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

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text").replace(/\D/g, "");

    if (!pastedText) return;

    const updatedValue = [...value];

    for (let i = 0; i < pastedText.length && index + i < length; i += 1) {
      updatedValue[index + i] = pastedText[i];
    }

    onChange(updatedValue);
    focusInput(Math.min(index + pastedText.length, length - 1));
  };

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      <div
        className="flex items-center justify-center gap-2 sm:gap-3"
        role="group"
        aria-label="One-time password"
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus={autoFocus && index === 0}
            maxLength={1}
            disabled={disabled}
            value={value[index] ?? ""}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={(event) => event.target.select()}
            aria-label={`OTP digit ${index + 1} of ${length}`}
            aria-invalid={Boolean(error) || undefined}
            className={cn(
              "h-12 w-11 rounded-input border bg-surface text-center text-h3 font-semibold text-foreground shadow-soft",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-danger focus-visible:outline-danger"
                : "border-border hover:border-foreground-muted",
              "sm:h-14 sm:w-14",
            )}
          />
        ))}
      </div>

      {error ? <p className="text-center text-small text-danger">{error}</p> : null}
    </div>
  );
}

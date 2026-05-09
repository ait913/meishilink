import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  error?: string;
  hint?: string;
};

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Input({ label, error, hint, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-neutral-700">
      <span className="font-medium">{label}</span>
      <input
        className={`min-h-11 rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-neutral-950 outline-none transition focus:border-neutral-500 ${className}`}
        {...props}
      />
      {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, hint, className = "", ...props }: TextareaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-neutral-700">
      <span className="font-medium">{label}</span>
      <textarea
        className={`rounded-3xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none transition focus:border-neutral-500 ${className}`}
        {...props}
      />
      {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}


import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition placeholder:text-muted focus:border-ink ${className}`}
      {...props}
    />
  );
}

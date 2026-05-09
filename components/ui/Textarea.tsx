import { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-muted focus:border-ink ${className}`}
      {...props}
    />
  );
}

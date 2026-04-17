import React from "react";

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-md border outline-none ${className}`}
      {...props}
    />
  );
}
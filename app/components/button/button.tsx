"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  label: ReactNode;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export default function Button({
  label,
  disabled,
  className,
  ariaLabel,
  onClick,
}: ButtonProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

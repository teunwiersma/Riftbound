"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export enum ButtonState {
  active = "active",
  disabled = "disabled",
}

type ButtonProps = {
  label: ReactNode;
  state?: ButtonState;
  className?: string;
  ariaLabel?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export default function Button({
  label,
  state = ButtonState.active,
  className,
  ariaLabel,
  onClick,
}: ButtonProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      disabled={state === ButtonState.disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

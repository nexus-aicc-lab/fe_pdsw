// components/ui/CommonCheckBox.tsx
"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommonCheckBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const checkIconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

const variantClasses = {
  primary: "border-gray-300 bg-white hover:bg-gray-100 focus:ring-[#5BC2C1]",
  secondary: "border-gray-300 bg-white hover:bg-gray-100 focus:ring-blue-500",
};

export const CommonCheckBox = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
  size = "md",
  variant = "primary",
}: CommonCheckBoxProps) => {
  return (
    <div className="flex items-center">
      <div
        className={cn(
          "relative flex items-center justify-center rounded border",
          sizeClasses[size],
          variantClasses[variant],
          checked ? (variant === "primary" ? "bg-[#5BC2C1] border-[#5BC2C1]" : "bg-blue-500 border-blue-500") : "",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && (
          <Check
            size={checkIconSizes[size]}
            className="text-white"
            strokeWidth={3}
          />
        )}
      </div>
      {label && (
        <label
          className={cn(
            "ml-2 text-sm",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          )}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
};
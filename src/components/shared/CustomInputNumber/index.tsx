import * as React from "react";
import { Input } from "@/components/ui/input"; // Shadcn UI Input 사용

interface CustomInputNumberProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const CustomInputNumber = React.forwardRef<HTMLInputElement, CustomInputNumberProps>(
  ({ value, onChange, onBlur, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        // inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)} // ✨ 자유롭게 입력 허용
        onBlur={onBlur} // ✨ 숫자 검증은 여기서
        {...props}
      />
    );
  }
);

CustomInputNumber.displayName = "CustomInputNumber";

export { CustomInputNumber };
